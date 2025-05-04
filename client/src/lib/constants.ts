import { Companion, AIModel } from "./types";

// Type guard pour AIModel
export function isAIModel(value: string): value is AIModel {
  return ["gemini", "deepseek", "claude", "gpt-4"].includes(value as AIModel);
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
  }
];

export const MAX_COMPANION_NAME_LENGTH = 30;
export const MAX_COMPANION_DESCRIPTION_LENGTH = 300;

export const AI_MODELS = [
  { id: "gemini", name: "Gemini", isDefault: true },
  { id: "deepseek", name: "DeepSeek", isDefault: false },
  { id: "claude", name: "Claude", isDefault: false },
  { id: "gpt-4", name: "GPT-4", isDefault: false }
];

export const IMAGE_DIMENSIONS = [
  { width: 512, height: 512 },
  { width: 768, height: 512 },
  { width: 512, height: 768 }
];
