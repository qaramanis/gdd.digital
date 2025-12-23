import { streamText } from "ai";
import { getModel, DEFAULT_MODEL_ID } from "@/lib/ai/client";
import {
  buildCompletionPrompt,
  SECTION_SYSTEM_PROMPTS,
  type GameContext,
} from "@/lib/ai/prompts";
import type { AIModelId } from "@/database/drizzle/schema/preferences";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sectionType,
      subSectionType,
      currentText,
      gameContext,
      modelId,
    }: {
      sectionType: string;
      subSectionType: string;
      currentText: string;
      gameContext: GameContext;
      modelId?: AIModelId;
    } = body;

    // Validate inputs
    if (!currentText || currentText.trim().length < 3) {
      return new Response(JSON.stringify({ completion: "" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = SECTION_SYSTEM_PROMPTS[sectionType] ||
      SECTION_SYSTEM_PROMPTS.overview;

    const userPrompt = buildCompletionPrompt({
      sectionType,
      subSectionType,
      currentText,
      gameContext,
    });

    const result = streamText({
      model: getModel(modelId || DEFAULT_MODEL_ID),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 100,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI completion error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate completion" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
