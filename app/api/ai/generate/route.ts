import { streamText } from "ai";
import { anthropic, DEFAULT_MODEL } from "@/lib/ai/client";
import {
  SECTION_SYSTEM_PROMPTS,
  SUBSECTION_COMPLETION_PROMPTS,
  type GameContext,
} from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sectionType,
      subSectionType,
      gameContext,
    }: {
      sectionType: string;
      subSectionType: string;
      gameContext: GameContext;
    } = body;

    const systemPrompt = SECTION_SYSTEM_PROMPTS[sectionType] ||
      SECTION_SYSTEM_PROMPTS.overview;

    const subSectionPrompt = SUBSECTION_COMPLETION_PROMPTS[subSectionType] ||
      "Write professional content for this game design document section.";

    const gameInfo = `
Game Name: ${gameContext.name}
Game Concept: ${gameContext.concept}
Platforms: ${gameContext.platforms.join(", ")}
${gameContext.timeline ? `Timeline: ${gameContext.timeline}` : ""}
`.trim();

    const userPrompt = `${subSectionPrompt}

Game Information:
${gameInfo}

Generate professional, engaging content for this section. Write 2-4 paragraphs that are specific to this game and would fit in a professional game design document.`;

    const result = streamText({
      model: anthropic(DEFAULT_MODEL),
      system: systemPrompt,
      prompt: userPrompt,
      maxOutputTokens: 800,
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
