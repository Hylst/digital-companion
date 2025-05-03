import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Base user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// AI Companions
export const companions = pgTable("companions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  role: text("role").notNull(),
  avatar: text("avatar"),
  description: text("description"),
  personality: text("personality").notNull(),
  isOnline: boolean("is_online").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastInteraction: timestamp("last_interaction"),
});

export const insertCompanionSchema = createInsertSchema(companions, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  role: (schema) => schema.min(2, "Role must be at least 2 characters"),
  personality: (schema) => schema.min(2, "Personality must be at least 2 characters"),
});

// Conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companionId: integer("companion_id").references(() => companions.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations);

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // user or assistant
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages);

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  provider: text("provider").notNull(),
  key: text("key").notNull(),
  isValid: boolean("is_valid").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys);

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activeModel: text("active_model").default("gemini"),
  theme: text("theme").default("light"),
  voiceEnabled: boolean("voice_enabled").default(false),
  preferences: jsonb("preferences").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings);

// Relations
export const companionsRelations = relations(companions, ({ one, many }) => ({
  user: one(users, { fields: [companions.userId], references: [users.id] }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  companion: one(companions, { fields: [conversations.companionId], references: [companions.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Companion = typeof companions.$inferSelect;
export type InsertCompanion = z.infer<typeof insertCompanionSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
