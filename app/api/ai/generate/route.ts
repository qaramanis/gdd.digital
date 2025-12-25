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

    // Get the async iterator for the text stream
    const textIterator = result.textStream[Symbol.asyncIterator]();

    // Await the first chunk to trigger the API call and catch any initial errors
    // This happens BEFORE we return the response, so we can return a proper error status
    let firstChunk: string;
    try {
      const first = await textIterator.next();
      if (first.done) {
        return new Response(
          JSON.stringify({ error: "No content generated" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
      firstChunk = first.value;
    } catch (error) {
      console.error("AI generation error (first chunk):", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate content" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // First chunk succeeded - now stream the rest
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send the first chunk we already received
        controller.enqueue(encoder.encode(firstChunk));

        // Continue streaming remaining chunks
        try {
          while (true) {
            const { done, value } = await textIterator.next();
            if (done) break;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (error) {
          console.error("AI streaming error:", error);
          controller.enqueue(encoder.encode("\n__GENERATION_ERROR__"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
