import { Companion, AIModel } from "./types";

// Type guard pour AIModel
export function isAIModel(value: string): value is AIModel {
  return ["gemini", "deepseek", "claude", "gpt-4", "ollama", "perplexity"].includes(value as AIModel);
}

export const PERSONALITIES = [
  {
    id: "friendly",
    name: "Friendly",
    icon: "smile",
    description: "Warm, supportive & empathetic",
    color: "secondary"
  },
  {
    id: "analytical",
    name: "Analytical",
    icon: "brain",
    description: "Logical, detailed & precise",
    color: "primary"
  },
  {
    id: "creative",
    name: "Creative",
    icon: "lightbulb",
    description: "Imaginative, artistic & inspiring",
    color: "accent"
  },
  {
    id: "coach",
    name: "Coach",
    icon: "dumbbell",
    description: "Motivating, guiding & direct",
    color: "green-500"
  },
  {
    id: "philosophical",
    name: "Philosophical",
    icon: "book-open",
    description: "Thoughtful, contemplative & wise",
    color: "blue-600"
  },
  {
    id: "witty",
    name: "Witty",
    icon: "zap",
    description: "Humorous, clever & quick-witted",
    color: "orange-500"
  },
  {
    id: "supportive",
    name: "Supportive",
    icon: "heart",
    description: "Understanding, compassionate & gentle",
    color: "rose-500"
  },
  {
    id: "mentor",
    name: "Mentor",
    icon: "graduation-cap",
    description: "Wise, experienced & guiding",
    color: "yellow-600"
  }
];

export const DEFAULT_COMPANIONS: Partial<Companion>[] = [
  {
    name: "Luna",
    role: "Creative Friend",
    personality: "creative",
    avatar: "/avatars/luna.jpg",
    description: "A creative and artistic companion who helps with inspiration and creative projects.",
    isOnline: true
  },
  {
    name: "Max",
    role: "Productivity Coach",
    personality: "coach",
    avatar: "/avatars/max.jpg",
    description: "A motivational companion who helps you stay organized and achieve your goals.",
    isOnline: false
  },
  {
    name: "Sophia",
    role: "Wellness Guide",
    personality: "friendly",
    avatar: "/avatars/sophia.jpg",
    description: "A compassionate companion focused on mental and physical wellbeing.",
    isOnline: false
  },
  {
    name: "Alex",
    role: "Study Buddy",
    personality: "analytical",
    avatar: "/avatars/alex.jpg",
    description: "A detail-oriented companion who helps with learning, research, and academic pursuits.",
    isOnline: true
  },
  {
    name: "Zen",
    role: "Philosophy Guide",
    personality: "philosophical",
    avatar: "/avatars/zen.jpg",
    description: "A thoughtful companion who explores deep questions about life, meaning, and existence.",
    isOnline: true
  },
  {
    name: "Mia",
    role: "Comedy Partner",
    personality: "witty",
    avatar: "/avatars/mia.jpg",
    description: "A humorous companion who brightens your day with jokes, wordplay, and witty observations.",
    isOnline: false
  },
  {
    name: "Oliver",
    role: "Emotional Support",
    personality: "supportive",
    avatar: "/avatars/oliver.jpg",
    description: "A gentle companion who listens without judgment and offers comfort during tough times.",
    isOnline: true
  },
  {
    name: "Sage",
    role: "Life Mentor",
    personality: "mentor",
    avatar: "/avatars/sage.jpg",
    description: "A wise companion who guides personal growth with experience and thoughtful advice.",
    isOnline: false
  }
];

export const MAX_COMPANION_NAME_LENGTH = 30;
export const MAX_COMPANION_DESCRIPTION_LENGTH = 300;

export const AI_MODELS = [
  { id: "gemini" as AIModel, name: "Gemini", isDefault: true },
  { id: "gpt-4" as AIModel, name: "GPT-4 (OpenAI)", isDefault: false },
  { id: "ollama" as AIModel, name: "Llama3 (Ollama)", isDefault: false },
  { id: "perplexity" as AIModel, name: "Perplexity AI", isDefault: false },
  { id: "deepseek" as AIModel, name: "DeepSeek", isDefault: false },
  { id: "claude" as AIModel, name: "Claude", isDefault: false }
];

export const IMAGE_DIMENSIONS = [
  { width: 512, height: 512 },
  { width: 768, height: 512 },
  { width: 512, height: 768 }
];
