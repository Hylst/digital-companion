import { storage } from './storage';

/**
 * Get API key for a specific provider
 */
export async function getApiKey(provider: string): Promise<string | null> {
  return await storage.getApiKey(provider);
}

/**
 * Truncate message content for logging
 */
export function truncateForLogging(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Validates API key with the provider
 */
export async function validateApiKey(provider: string, key: string): Promise<boolean> {
  // Basic validation - real implementation would actually test the key with the provider
  if (!key || key.length < 10) return false;
  
  // Different validation for different providers could be implemented here
  switch (provider) {
    case 'gemini':
      return key.startsWith('AI') || key.length > 20;
    case 'deepseek':
      return key.startsWith('sk-') || key.length > 20;
    case 'stability':
      return key.startsWith('sk-') || key.length > 20;
    case 'openai':
      return key.startsWith('sk-') || key.length > 20;
    case 'perplexity':
      return key.startsWith('pplx-') || key.length > 20;
    default:
      return key.length > 10;
  }
}

/**
 * Parse incoming WebSocket messages
 */
export function parseWSMessage(data: string): any {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse WebSocket message:', e);
    return null;
  }
}

/**
 * Sanitize content for display
 */
export function sanitizeContent(content: string): string {
  // Basic sanitization
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Extracts image URLs from markdown content
 */
export function extractImageUrls(content: string): string[] {
  const regex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Transform API response into a standardized format
 */
export function transformResponse(data: any, provider: string): { text: string; model: string } {
  // Different providers have different response formats
  switch (provider) {
    case 'gemini':
      if (data.candidates && data.candidates[0]) {
        return {
          text: data.candidates[0].content.parts[0].text,
          model: 'gemini'
        };
      }
      break;
    case 'deepseek':
      if (data.choices && data.choices[0]) {
        return {
          text: data.choices[0].message.content,
          model: 'deepseek'
        };
      }
      break;
  }
  
  // Default fallback
  return {
    text: "I'm having trouble processing that request right now.",
    model: provider
  };
}
