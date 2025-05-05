export type AIModel = "gemini" | "deepseek" | "claude" | "gpt-4" | "ollama" | "perplexity";

export interface Companion {
  id: number;
  name: string;
  role: string;
  avatar: string;
  description: string;
  personality: string;
  isOnline: boolean;
  createdAt: string;
  lastInteraction?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
  imageUrl?: string;
}

export interface Conversation {
  id: number;
  companionId: number;
  name: string;
  lastMessage?: string;
  lastMessageDate?: string;
  messages: Message[];
}

export interface APIKey {
  id: number;
  provider: string;
  key: string;
  isValid: boolean;
}

export interface TextToImageRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
}

export interface TextToImageResponse {
  imageUrl: string;
  prompt: string;
}

export interface SpeechToTextResponse {
  text: string;
  confidence: number;
}
