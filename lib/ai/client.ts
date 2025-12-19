import { createAnthropic } from "@ai-sdk/anthropic";

// Create Anthropic client
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default model for completions
export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// Faster model for ghost text completions
export const FAST_MODEL = "claude-sonnet-4-20250514";
