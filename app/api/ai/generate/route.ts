import { streamText } from "ai";
import { getModel, DEFAULT_MODEL_ID } from "@/lib/ai/client";
import {
  buildGenerationPrompt,
  validateGenerationContext,
  GENERATION_SYSTEM_PROMPT,
  type GameContext,
  type AllSectionsContent,
} from "@/lib/ai/prompts";
import { getSubSection } from "@/lib/gdd/sections";
import type { AIModelId } from "@/database/drizzle/schema/preferences";

export const runtime = "nodejs";
export const maxDuration = 60;

interface GenerateRequest {
  sectionType: string;
  subSectionType: string;
  gameContext: GameContext;
  allContent: AllSectionsContent;
  modelId?: AIModelId;
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const {
      sectionType,
      subSectionType,
      gameContext,
      allContent = {},
      modelId,
    } = body;

    // Get subsection info including instructions
    const subSection = getSubSection(sectionType, subSectionType);
    if (!subSection) {
      return new Response(
        JSON.stringify({ error: `Unknown subsection: ${sectionType}/${subSectionType}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate that we have enough context
    const validation = validateGenerationContext(gameContext, allContent);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({
          error: validation.error,
          code: "INSUFFICIENT_CONTEXT",
          filledCount: validation.filledCount,
          hasGameInfo: validation.hasGameInfo,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build the context-aware prompt
    const userPrompt = buildGenerationPrompt({
      sectionType,
      subSectionType,
      subSectionTitle: subSection.title,
      instructions: subSection.instructions,
      gameContext,
      allContent,
    });

    const result = streamText({
      model: getModel(modelId || DEFAULT_MODEL_ID),
      system: GENERATION_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
