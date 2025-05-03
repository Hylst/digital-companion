import { db } from "./index";
import * as schema from "@shared/schema";
import { DEFAULT_COMPANIONS } from "../client/src/lib/constants";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Check for existing companions
    const existingCompanions = await db.query.companions.findMany();
    
    if (existingCompanions.length === 0) {
      console.log("No companions found, creating default companions...");
      
      // Insert default companions
      for (const companion of DEFAULT_COMPANIONS) {
        const [inserted] = await db.insert(schema.companions).values({
          name: companion.name || "",
          role: companion.role || "",
          avatar: companion.avatar || "",
          description: companion.description || "",
          personality: companion.personality || "friendly",
          isOnline: companion.isOnline || false,
        }).returning();
        
        console.log(`Created companion: ${inserted.name}`);
        
        // Create default conversation for each companion
        const [conversation] = await db.insert(schema.conversations).values({
          companionId: inserted.id,
          name: `Chat with ${inserted.name}`,
        }).returning();
        
        console.log(`Created conversation for ${inserted.name}`);
        
        // Add welcome message
        await db.insert(schema.messages).values({
          conversationId: conversation.id,
          content: `Hi there! I'm ${inserted.name}, your ${inserted.role?.toLowerCase() || "AI companion"}! How can I help you today?`,
          role: "assistant",
        });
        
        console.log(`Added welcome message for ${inserted.name}`);
      }
    } else {
      console.log(`Found ${existingCompanions.length} existing companions, skipping default companions creation.`);
    }
    
    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
