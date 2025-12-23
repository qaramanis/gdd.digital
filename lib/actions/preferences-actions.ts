"use server";

import { db } from "@/database/drizzle";
import {
  userPreferences,
  AI_MODELS,
  type AIModelId,
} from "@/database/drizzle/schema/preferences";
import { eq } from "drizzle-orm";
import { isProviderConfigured } from "@/lib/ai/client";

export interface UserPreferencesResult {
  success: boolean;
  preferences?: {
    preferredAiModel: AIModelId;
  };
  error?: string;
}

export async function getUserPreferences(
  userId: string
): Promise<UserPreferencesResult> {
  try {
    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (result.length === 0) {
      // Return default preferences
      return {
        success: true,
        preferences: {
          preferredAiModel: "claude-sonnet",
        },
      };
    }

    return {
      success: true,
      preferences: {
        preferredAiModel: (result[0].preferredAiModel as AIModelId) || "claude-sonnet",
      },
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      success: false,
      error: "Failed to fetch preferences",
    };
  }
}

export async function updateUserPreferences(
  userId: string,
  preferredAiModel: AIModelId
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate the model ID
    if (!AI_MODELS[preferredAiModel]) {
      return {
        success: false,
        error: "Invalid AI model selected",
      };
    }

    // Check if the provider is configured
    const model = AI_MODELS[preferredAiModel];
    if (!isProviderConfigured(model.provider)) {
      return {
        success: false,
        error: `${model.name} is not available. API key not configured.`,
      };
    }

    // Check if preferences exist
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      // Create new preferences
      await db.insert(userPreferences).values({
        userId,
        preferredAiModel,
      });
    } else {
      // Update existing preferences
      await db
        .update(userPreferences)
        .set({
          preferredAiModel,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId));
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return {
      success: false,
      error: "Failed to update preferences",
    };
  }
}

export async function getAvailableModelsForUser(): Promise<{
  success: boolean;
  models?: Array<{
    id: AIModelId;
    name: string;
    provider: string;
    description: string;
    available: boolean;
  }>;
  error?: string;
}> {
  try {
    const models = Object.entries(AI_MODELS).map(([id, model]) => ({
      id: id as AIModelId,
      name: model.name,
      provider: model.provider,
      description: model.description,
      available: isProviderConfigured(model.provider),
    }));

    return {
      success: true,
      models,
    };
  } catch (error) {
    console.error("Error getting available models:", error);
    return {
      success: false,
      error: "Failed to get available models",
    };
  }
}
