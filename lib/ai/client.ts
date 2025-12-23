import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";
import { AI_MODELS, type AIModelId } from "@/database/drizzle/schema/preferences";

// Create provider clients
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const xai = createXai({
  apiKey: process.env.XAI_API_KEY,
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Default model ID
export const DEFAULT_MODEL_ID: AIModelId = "claude-sonnet";

// Get the AI model instance based on model ID
export function getModel(modelId: AIModelId = DEFAULT_MODEL_ID) {
  const modelConfig = AI_MODELS[modelId];

  switch (modelConfig?.provider) {
    case "anthropic":
      return anthropic(modelConfig.model);
    case "openai":
      return openai(modelConfig.model);
    case "google":
      return google(modelConfig.model);
    case "xai":
      return xai(modelConfig.model);
    case "groq":
      return groq(modelConfig.model);
    default:
      return anthropic("claude-sonnet-4-20250514");
  }
}

// Check if a provider is configured (has API key)
export function isProviderConfigured(provider: string): boolean {
  switch (provider) {
    case "anthropic":
      return !!process.env.ANTHROPIC_API_KEY;
    case "openai":
      return !!process.env.OPENAI_API_KEY;
    case "google":
      return !!process.env.GOOGLE_AI_API_KEY;
    case "xai":
      return !!process.env.XAI_API_KEY;
    case "groq":
      return !!process.env.GROQ_API_KEY;
    default:
      return false;
  }
}
