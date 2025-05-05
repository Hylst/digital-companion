import axios from 'axios';
import { storage } from './storage';
import { getApiKey } from './utils';
import OpenAI from 'openai';

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
    case 'philosophical':
      return `a thoughtful, contemplative and wise ${companion.role}. ${baseDescription}. You ponder deep questions and provide meaningful insights about life, existence, and human nature.`;
    case 'witty':
      return `a humorous, clever and quick-witted ${companion.role}. ${baseDescription}. You use humor, wordplay, and clever observations in your responses.`;
    case 'supportive':
      return `an understanding, compassionate and gentle ${companion.role}. ${baseDescription}. You provide emotional support, validate feelings, and offer gentle encouragement.`;
    case 'mentor':
      return `a wise, experienced and guiding ${companion.role}. ${baseDescription}. You share wisdom, offer guidance, and help develop skills and knowledge.`;
    default:
      return `${companion.role}. ${baseDescription}`;
  }
}

// OpenAI API client
async function generateWithOpenAI(prompt: string, companionData: any, options: any = {}) {
  const apiKey = await getApiKey('openai');
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const openai = new OpenAI({ apiKey });
  const personalityContext = getPersonalityContext(companionData);
  const systemPrompt = `You are ${companionData.name}, ${personalityContext}. 
    Respond as if you are ${companionData.name} with the described personality traits.
    Keep responses concise and engaging. If asked to generate an image, respond with a
    creative description of what the image might look like.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 800,
    });

    return {
      text: response.choices[0].message.content || "I'm sorry, I couldn't generate a response.",
      model: 'gpt-4'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Ollama API client (open-source LLM)
async function generateWithOllama(prompt: string, companionData: any, options: any = {}) {
  // Ollama is typically run locally, so we'll use a default endpoint
  const ollamaEndpoint = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434/api/generate';
  
  const personalityContext = getPersonalityContext(companionData);
  const systemPrompt = `You are ${companionData.name}, ${personalityContext}. 
    Respond as if you are ${companionData.name} with the described personality traits.
    Keep responses concise and engaging.`;

  const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\n${companionData.name}:`;

  try {
    const response = await axios.post(ollamaEndpoint, {
      model: 'llama3', // Default to llama3, but could be configurable
      prompt: fullPrompt,
      temperature: options.temperature || 0.7,
      max_length: options.maxTokens || 800,
      stream: false
    });

    return {
      text: response.data.response || "I'm sorry, I couldn't generate a response.",
      model: 'ollama'
    };
  } catch (error) {
    console.error('Ollama API error:', error);
    throw error;
  }
}

// Perplexity API client
async function generateWithPerplexity(prompt: string, companionData: any, options: any = {}) {
  const apiKey = await getApiKey('perplexity');
  if (!apiKey) {
    throw new Error('Perplexity API key not found');
  }

  const personalityContext = getPersonalityContext(companionData);
  const systemPrompt = `You are ${companionData.name}, ${personalityContext}. 
    Respond as if you are ${companionData.name} with the described personality traits.
    Keep responses concise and engaging.`;

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 800,
        stream: false
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
      model: 'perplexity'
    };
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw error;
  }
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
    throw error;
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
    throw error;
  }
}

// HuggingFace API client (free text generation fallback)
async function generateWithHuggingFace(prompt: string, companionData: any, options: any = {}) {  
  const personalityContext = getPersonalityContext(companionData);
  const systemPrompt = `You are ${companionData.name}, ${personalityContext}. 
    Respond as if you are ${companionData.name} with the described personality traits.
    Keep responses concise and engaging.`;

  const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\n${companionData.name}:`;

  try {
    // Use the free public Hugging Face API with one of the open source models
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        inputs: fullPrompt,
        parameters: {
          temperature: options.temperature || 0.7,
          max_new_tokens: options.maxTokens || 800,
          return_full_text: false
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the generated text
    let generatedText = '';
    if (response.data && response.data[0] && response.data[0].generated_text) {
      generatedText = response.data[0].generated_text;
    } else if (typeof response.data === 'string') {
      generatedText = response.data;
    } else {
      console.error('Unexpected HuggingFace response format:', response.data);
      generatedText = "I'm sorry, I couldn't generate a meaningful response right now.";
    }
    
    return {
      text: generatedText,
      model: 'huggingface'
    };
  } catch (error) {
    console.error('HuggingFace API error:', error);
    throw error;
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
  try {
    // First try the selected model
    try {
      switch (model) {
        case 'deepseek':
          return await generateWithDeepseek(fullPrompt, companion, { temperature, maxTokens });
        case 'gpt-4':
          // Check if OpenAI key exists
          const openaiKey = await getApiKey('openai');
          if (openaiKey) {
            return await generateWithOpenAI(fullPrompt, companion, { temperature, maxTokens });
          } else {
            console.log('OpenAI API key not found, falling back to Gemini');
            throw new Error('OpenAI API key not found');
          }
        case 'ollama':
          return await generateWithOllama(fullPrompt, companion, { temperature, maxTokens });
        case 'perplexity':
          // Check if Perplexity key exists
          const perplexityKey = await getApiKey('perplexity');
          if (perplexityKey) {
            return await generateWithPerplexity(fullPrompt, companion, { temperature, maxTokens });
          } else {
            console.log('Perplexity API key not found, falling back to Gemini');
            throw new Error('Perplexity API key not found');
          }
        case 'gemini':
        default:
          return await generateWithGemini(fullPrompt, companion, { temperature, maxTokens });
      }
    } catch (modelError) {
      console.error(`Error with model ${model}:`, modelError);
      
      // Fallback to Hugging Face free API
      try {
        console.log('Trying Hugging Face fallback...');
        const huggingFaceResponse = await generateWithHuggingFace(fullPrompt, companion, { temperature, maxTokens });
        if (huggingFaceResponse) {
          return huggingFaceResponse;
        }
      } catch (hfError) {
        console.error('Hugging Face fallback failed:', hfError);
        throw hfError; // Re-throw to be caught by outer try-catch
      }
    }
    
    throw new Error('All model attempts failed');
  } catch (error) {
    console.error(`All LLM attempts failed:`, error);
    // Final fallback response if all APIs fail
    return {
      text: `I'm ${companion.name}, but I'm having trouble connecting to my AI services right now. Could you try again in a moment?`,
      model: model
    };
  }
}

// Generate image using OpenAI DALL-E
export async function generateImageWithOpenAI(prompt: string) {
  const apiKey = await getApiKey('openai');
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json"
    });

    // Handle response safely
    if (response && response.data && response.data.length > 0 && response.data[0].b64_json) {
      return `data:image/png;base64,${response.data[0].b64_json}`;
    } else {
      throw new Error('No image generated from OpenAI');
    }
  } catch (error) {
    console.error('OpenAI DALL-E error:', error);
    throw error;
  }
}

// Generate image using Stability AI or fallback
export async function generateImage(prompt: string, apiKey?: string) {
  // First try OpenAI DALL-E if available
  try {
    const openaiKey = await getApiKey('openai');
    if (openaiKey) {
      return await generateImageWithOpenAI(prompt);
    }
  } catch (error) {
    console.error('OpenAI image generation failed, trying alternatives', error);
  }

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
      
      if (response.data && response.data.artifacts && response.data.artifacts.length > 0) {
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
    
    if (response && response.data) {
      const base64Image = Buffer.from(response.data).toString('base64');
      return `data:image/png;base64,${base64Image}`;
    } else {
      throw new Error('No image data received from Hugging Face');
    }
  } catch (error) {
    console.error('Hugging Face API error:', error);
    
    // Last resort fallback - use a placeholder image from Unsplash
    console.log('Using fallback image from Unsplash');
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(prompt.split(' ').slice(0, 3).join(' '))}`;
  }
}