import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";

// Available AI models
export const AI_MODELS = {
  "claude-sonnet": {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    description: "Balanced performance and speed",
  },
  "claude-haiku": {
    id: "claude-haiku",
    name: "Claude Haiku",
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    description: "Fast and efficient",
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "ChatGPT 4o",
    provider: "openai",
    model: "gpt-4o",
    description: "OpenAI's flagship model",
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "ChatGPT 4o Mini",
    provider: "openai",
    model: "gpt-4o-mini",
    description: "Fast and affordable",
  },
  "gemini-2-flash": {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    model: "gemini-2.0-flash",
    description: "Google's fast model",
  },
  "grok-4": {
    id: "grok-4",
    name: "Grok 4",
    provider: "xai",
    model: "grok-4",
    description: "xAI's flagship model",
  },
  "llama-3.3-70b": {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    description: "Fast & free via Groq",
  },
  "mixtral-8x7b": {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B",
    provider: "groq",
    model: "mixtral-8x7b-32768",
    description: "Fast & free via Groq",
  },
} as const;

export type AIModelId = keyof typeof AI_MODELS;
export type AIModel = (typeof AI_MODELS)[AIModelId];

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  preferredAiModel: text("preferred_ai_model").default("claude-sonnet"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));
