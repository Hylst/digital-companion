// LLM Models
export type LLMProvider = "gemini" | "deepseek" | "claude" | "gpt-4";

export interface LLMRequestParams {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  text: string;
  model: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Text-to-Image
export interface TextToImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

export interface TextToImageResponse {
  imageUrl: string;
  prompt: string;
}

// WebSocket Message Types
export interface WSUserMessage {
  type: "user_message";
  content: string;
  companionId: number;
}

export interface WSCompanionMessage {
  type: "companion_message";
  content: string;
  companionId: number;
  messageId: number;
}

export interface WSTypingIndicator {
  type: "typing_indicator";
  companionId: number;
  isTyping: boolean;
}

export interface WSSystemNotification {
  type: "system_notification";
  content: string;
  level: "info" | "warning" | "error";
}

export type WSMessage = WSUserMessage | WSCompanionMessage | WSTypingIndicator | WSSystemNotification;
