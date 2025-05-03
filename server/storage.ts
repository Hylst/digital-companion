import { db } from "@db";
import { 
  companions, 
  conversations, 
  messages, 
  apiKeys, 
  settings,
  type Companion,
  type Message,
  type ApiKey,
  insertCompanionSchema,
  insertMessageSchema
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface SaveMessageOptions {
  companionId: number;
  content: string;
  role: "user" | "assistant";
  imageUrl?: string;
}

export interface SaveApiKeyOptions {
  provider: string;
  key: string;
}

export interface CompanionCreateInput {
  name: string;
  role: string;
  avatar?: string;
  description?: string;
  personality: string;
}

export const storage = {
  // Companions
  async getCompanions(): Promise<Companion[]> {
    return await db.query.companions.findMany({
      orderBy: desc(companions.createdAt)
    });
  },
  
  async getCompanionById(id: number): Promise<Companion | null> {
    return await db.query.companions.findFirst({
      where: eq(companions.id, id)
    });
  },
  
  async createCompanion(input: CompanionCreateInput): Promise<Companion> {
    // Validate input
    const validated = insertCompanionSchema.parse({
      name: input.name,
      role: input.role,
      avatar: input.avatar || null,
      description: input.description || null,
      personality: input.personality,
      isOnline: true
    });
    
    // Insert companion
    const [companion] = await db.insert(companions).values(validated).returning();
    
    // Create default conversation
    const [conversation] = await db.insert(conversations).values({
      companionId: companion.id,
      name: `Chat with ${companion.name}`
    }).returning();
    
    // Add welcome message
    await db.insert(messages).values({
      conversationId: conversation.id,
      content: `Hi there! I'm ${companion.name}, your ${companion.role.toLowerCase()}! How can I help you today?`,
      role: "assistant"
    });
    
    return companion;
  },
  
  // Conversations
  async getConversationByCompanionId(companionId: number) {
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.companionId, companionId),
      orderBy: desc(conversations.createdAt)
    });
    
    // If no conversation exists, create one
    if (!conversation) {
      const companion = await this.getCompanionById(companionId);
      if (!companion) throw new Error(`Companion with ID ${companionId} not found`);
      
      const [newConversation] = await db.insert(conversations).values({
        companionId,
        name: `Chat with ${companion.name}`
      }).returning();
      
      return newConversation;
    }
    
    return conversation;
  },
  
  // Messages
  async getConversationMessages(companionId: number): Promise<Message[]> {
    const conversation = await this.getConversationByCompanionId(companionId);
    
    return await db.query.messages.findMany({
      where: eq(messages.conversationId, conversation.id),
      orderBy: [messages.createdAt]
    });
  },
  
  async saveMessage(options: SaveMessageOptions): Promise<Message> {
    const { companionId, content, role, imageUrl } = options;
    
    // Get conversation for the companion
    const conversation = await this.getConversationByCompanionId(companionId);
    
    // Update conversation last updated
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id));
    
    // Update companion's last interaction time
    await db.update(companions)
      .set({ lastInteraction: new Date() })
      .where(eq(companions.id, companionId));
    
    // Insert the message
    const [message] = await db.insert(messages).values({
      conversationId: conversation.id,
      content,
      role,
      imageUrl: imageUrl || null
    }).returning();
    
    return message;
  },
  
  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return await db.query.apiKeys.findMany({
      orderBy: desc(apiKeys.updatedAt)
    });
  },
  
  async getApiKey(provider: string): Promise<string | null> {
    const key = await db.query.apiKeys.findFirst({
      where: and(
        eq(apiKeys.provider, provider),
        eq(apiKeys.isValid, true)
      )
    });
    
    return key ? key.key : null;
  },
  
  async saveApiKey(options: SaveApiKeyOptions): Promise<ApiKey> {
    const { provider, key } = options;
    
    // Check if key already exists
    const existingKey = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.provider, provider)
    });
    
    if (existingKey) {
      // Update existing key
      const [updated] = await db.update(apiKeys)
        .set({ 
          key, 
          isValid: true,
          updatedAt: new Date()
        })
        .where(eq(apiKeys.id, existingKey.id))
        .returning();
      
      return updated;
    } else {
      // Insert new key
      const [newKey] = await db.insert(apiKeys).values({
        provider,
        key,
        isValid: true
      }).returning();
      
      return newKey;
    }
  }
};
