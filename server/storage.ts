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
import { eq, and, desc, sql } from "drizzle-orm";

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
      .set({ updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(conversations.id, conversation.id));
    
    // Update companion's last interaction time
    await db.update(companions)
      .set({ lastInteraction: sql`CURRENT_TIMESTAMP` })
      .where(eq(companions.id, companionId));
    
    // Validate and insert the message
    const validated = insertMessageSchema.parse({
      conversationId: conversation.id,
      content,
      role,
      imageUrl: imageUrl || null
    });
    
    // Insert the message
    const [message] = await db.insert(messages).values(validated).returning();
    
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
    
    try {
      console.log(`Tentative d'enregistrement de clé API pour le fournisseur: ${provider}`);
      
      // Vérifier si la clé est valide (non vide)
      if (!key || key.trim() === '') {
        console.error(`Clé API invalide pour ${provider}: clé vide`);
        throw new Error(`Invalid API key for ${provider}: key is empty`);
      }
      
      // Check if key already exists
      const existingKey = await db.query.apiKeys.findFirst({
        where: eq(apiKeys.provider, provider)
      });
      
      let result;
      
      if (existingKey) {
        console.log(`Mise à jour d'une clé API existante pour ${provider}`);
        // Update existing key
        const [updated] = await db.update(apiKeys)
          .set({ 
            key, 
            isValid: true,
            updatedAt: sql`CURRENT_TIMESTAMP`
          })
          .where(eq(apiKeys.id, existingKey.id))
          .returning();
        
        result = updated;
      } else {
        console.log(`Création d'une nouvelle clé API pour ${provider}`);
        // Insert new key
        const [newKey] = await db.insert(apiKeys).values({
          provider,
          key,
          isValid: true
        }).returning();
        
        result = newKey;
      }
      
      console.log(`Clé API pour ${provider} enregistrée avec succès`);
      return result;
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement de la clé API pour ${provider}:`, error);
      throw error; // Propager l'erreur pour une meilleure gestion dans la route
    }
  }
};
