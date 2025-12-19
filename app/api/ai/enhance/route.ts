import { streamText } from "ai";
import { anthropic, DEFAULT_MODEL } from "@/lib/ai/client";
import {
  buildEnhancementPrompt,
  SECTION_SYSTEM_PROMPTS,
  type GameContext,
} from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      text,
      sectionType,
      gameContext,
    }: {
      action: "enhance" | "improve" | "expand" | "concise";
      text: string;
      sectionType: string;
      gameContext: GameContext;
    } = body;

    // Validate inputs
    if (!text || text.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "Text is too short to enhance" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = SECTION_SYSTEM_PROMPTS[sectionType] ||
      SECTION_SYSTEM_PROMPTS.overview;

    const userPrompt = buildEnhancementPrompt(action, text, gameContext);

    const result = streamText({
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI enhancement error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to enhance text" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
