"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  X,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIModelId } from "@/database/drizzle/schema/preferences";
import type { AllSectionsContent } from "@/lib/ai/prompts";

interface GameContext {
  name: string;
  concept: string;
  platforms: string[];
  timeline?: string;
}

interface SubSectionEditorProps {
  title: string;
  placeholder: string;
  subSectionType: string;
  sectionType: string;
  gameContext: GameContext;
  allContent: AllSectionsContent;
  initialContent?: string;
  onChange?: (content: string) => void;
  modelId?: AIModelId;
}

export function SubSectionEditor({
  title,
  placeholder,
  subSectionType,
  sectionType,
  gameContext,
  allContent,
  initialContent = "",
  onChange,
  modelId,
}: SubSectionEditorProps) {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const generateContent = useCallback(async () => {
    if (!editor) return;

    setGeneratedContent("");
    setIsGenerating(true);
    setGenerationError(null);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType,
          subSectionType,
          gameContext,
          allContent,
          modelId,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Check for validation errors
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "INSUFFICIENT_CONTEXT") {
          setGenerationError(errorData.error);
          return;
        }
        throw new Error(errorData.error || "Failed to generate content");
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let fullContent = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setGeneratedContent(fullContent.trim());
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Generation error:", error);
        setGenerationError("Failed to generate content. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [editor, sectionType, subSectionType, gameContext, allContent, modelId]);

  const acceptGenerated = useCallback(() => {
    if (!editor || !generatedContent) return;

    // Convert plain text paragraphs to HTML paragraphs
    const paragraphs = generatedContent
      .split(/\n\n+/) // Split by double newlines (paragraph breaks)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const htmlContent = paragraphs
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`) // Wrap in <p> tags, convert single newlines to <br>
      .join("");

    editor.commands.setContent(htmlContent);
    onChange?.(htmlContent);
    setGeneratedContent("");
  }, [editor, generatedContent, onChange]);

  const dismissGenerated = useCallback(() => {
    setGeneratedContent("");
  }, []);

  // Handle Tab/Esc keys for generated content
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (generatedContent) {
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          acceptGenerated();
        } else if (e.key === "Escape") {
          e.preventDefault();
          dismissGenerated();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [generatedContent, acceptGenerated, dismissGenerated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{title}</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateContent}
          disabled={isGenerating}
          className="h-7 text-xs gap-1"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              AI Generate
            </>
          )}
        </Button>
      </div>

      {/* Generation error message */}
      {generationError && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Cannot generate content</p>
            <p className="text-destructive/80">{generationError}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGenerationError(null)}
            className="h-6 w-6 p-0 shrink-0 hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="relative">
        <div
          className={cn(
            "border rounded-lg bg-background transition-colors",
            editor?.isFocused && "ring-2 ring-ring ring-offset-2",
          )}
        >
          <EditorContent editor={editor} />
        </div>

        {/* AI Generated content preview */}
        {(generatedContent || isGenerating) && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {isGenerating && !generatedContent ? (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <div className="text-sm text-accent whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row items-end justify-between">
              {generatedContent && !isGenerating && (
                <p className="text-xs text-accent mt-8">
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                    Tab
                  </kbd>{" "}
                  to accept or{" "}
                  <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                    Esc
                  </kbd>{" "}
                  to dismiss
                </p>
              )}
              {generatedContent && !isGenerating && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={acceptGenerated}
                    className="h-6 w-6 p-0"
                    title="Accept (Tab)"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateContent}
                    className="h-6 w-6 p-0"
                    title="Regenerate"
                  >
                    <RotateCcw className="h-3 w-3 text-orange-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissGenerated}
                    className="h-6 w-6 p-0"
                    title="Dismiss (Esc)"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
