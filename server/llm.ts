import axios from 'axios';
import { storage } from './storage';
import { getApiKey } from './utils';

interface GenerateLLMResponseOptions {
  prompt: string;
  companionId: number;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateImageOptions {
  prompt: string;
  width?: number;
  height?: number;
}

// Gemini API client
async function generateWithGemini(prompt: string, companionData: any, options: any = {}) {
  const apiKey = await getApiKey('gemini');
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const personalityContext = getPersonalityContext(companionData);
  const systemPrompt = `You are ${companionData.name}, ${personalityContext}. 
    Respond as if you are ${companionData.name} with the described personality traits.
    Keep responses concise and engaging. If asked to generate an image, respond with a
    creative description of what the image might look like.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand my role completely.' }]
          },
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 800,
          topP: 0.95,
          topK: 40
        }
      }
    );

    if (response.data.candidates && response.data.candidates[0]) {
      const text = response.data.candidates[0].content.parts[0].text;
      return {
        text,
        model: 'gemini'
      };
    } else {
      throw new Error('No response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback to mock response if API call fails
    return {
      text: `I'm ${companionData.name}, but I'm having trouble connecting to my AI services right now. Could you try again in a moment?`,
      model: 'gemini'
    };
  }
}

// DeepSeek API client
async function generateWithDeepseek(prompt: string, companionData: any, options: any = {}) {
  const apiKey = await getApiKey('deepseek');
  if (!apiKey) {
    throw new Error('DeepSeek API key not found');
  }

  const personalityContext = getPersonalityContext(companionData);
  const systemPrompt = `You are ${companionData.name}, ${personalityContext}. Respond as if you are ${companionData.name}.`;

  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return {
      text: response.data.choices[0].message.content,
      model: 'deepseek'
    };
  } catch (error) {
    console.error('DeepSeek API error:', error);
    
    // Fallback to mock response if API call fails
    return {
      text: `I'm ${companionData.name}, but I'm having trouble connecting to my AI services right now. Could you try again in a moment?`,
      model: 'deepseek'
    };
  }
}

// Generate LLM response based on model
export async function generateLLMResponse(options: GenerateLLMResponseOptions) {
  const { prompt, companionId, model, temperature, maxTokens } = options;
  
  // Get companion data
  const companion = await storage.getCompanionById(companionId);
  if (!companion) {
    throw new Error(`Companion with ID ${companionId} not found`);
  }
  
  // Get conversation history for context (last 10 messages)
  const messages = await storage.getConversationMessages(companionId);
  const recentMessages = messages.slice(-10);
  
  // Construct context with recent messages
  let conversationContext = '';
  if (recentMessages.length > 0) {
    conversationContext = 'Here are the most recent messages in our conversation:\n';
    recentMessages.forEach(msg => {
      const role = msg.role === 'user' ? 'Human' : companion.name;
      conversationContext += `${role}: ${msg.content}\n`;
    });
    conversationContext += '\nContinue the conversation as if you are ' + companion.name + '.\n';
  }
  
  // Full prompt with conversation context
  const fullPrompt = conversationContext + prompt;
  
  // Generate response based on selected model
  switch (model) {
    case 'deepseek':
      return await generateWithDeepseek(fullPrompt, companion, { temperature, maxTokens });
    case 'gemini':
    default:
      return await generateWithGemini(fullPrompt, companion, { temperature, maxTokens });
  }
}

// Generate image using Stability API or fallback
export async function generateImage(prompt: string, apiKey?: string) {
  // Try Stability AI if key is available
  if (apiKey) {
    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      if (response.data.artifacts && response.data.artifacts.length > 0) {
        const base64Image = response.data.artifacts[0].base64;
        return `data:image/png;base64,${base64Image}`;
      }
    } catch (error) {
      console.error('Stability API error:', error);
      // Fall through to fallback
    }
  }
  
  // Fallback to free Hugging Face API
  try {
    // Use the free public Hugging Face API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      { inputs: prompt },
      {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error('Hugging Face API error:', error);
    
    // Last resort fallback - use a placeholder image from Unsplash
    console.log('Using fallback image from Unsplash');
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(' '))}`;
  }
}

// Helper to get personality context based on companion data
function getPersonalityContext(companion: any) {
  const baseDescription = companion.description || `an AI companion with a ${companion.personality} personality`;
  
  switch (companion.personality) {
    case 'friendly':
      return `a warm, supportive and empathetic ${companion.role}. ${baseDescription}. You are encouraging, positive, and always make people feel comfortable.`;
    case 'analytical':
      return `a logical, detailed and precise ${companion.role}. ${baseDescription}. You provide thoughtful analysis, facts, and clear reasoning in your responses.`;
    case 'creative':
      return `an imaginative, artistic and inspiring ${companion.role}. ${baseDescription}. You think outside the box and offer innovative ideas and creative perspectives.`;
    case 'coach':
      return `a motivating, guiding and direct ${companion.role}. ${baseDescription}. You help people achieve their goals with practical advice and encouragement.`;
    default:
      return `${companion.role}. ${baseDescription}`;
  }
}
