"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  initialContent?: string;
  onChange?: (content: string) => void;
}

export function SubSectionEditor({
  title,
  placeholder,
  subSectionType,
  sectionType,
  gameContext,
  initialContent = "",
  onChange,
}: SubSectionEditorProps) {
  const [suggestion, setSuggestion] = useState<string>("");
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
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
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onChange?.(editor.getHTML());

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear suggestion when text changes
      setSuggestion("");

      // Only suggest if there's meaningful text
      if (text.length > 10 && !text.endsWith(" ")) {
        debounceRef.current = setTimeout(() => {
          fetchSuggestion(text);
        }, 800);
      }
    },
  });

  const fetchSuggestion = useCallback(
    async (text: string) => {
      setIsLoadingSuggestion(true);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionType,
            subSectionType,
            currentText: text,
            gameContext,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error("Failed to get suggestion");

        const reader = response.body?.getReader();
        if (!reader) return;

        let fullSuggestion = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullSuggestion += decoder.decode(value, { stream: true });
          setSuggestion(fullSuggestion.trim());
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Suggestion error:", error);
        }
      } finally {
        setIsLoadingSuggestion(false);
      }
    },
    [sectionType, subSectionType, gameContext]
  );

  const acceptSuggestion = useCallback(() => {
    if (!editor || !suggestion) return;

    editor.commands.insertContent(" " + suggestion);
    setSuggestion("");
  }, [editor, suggestion]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion("");
  }, []);

  const generateContent = useCallback(async () => {
    if (!editor) return;

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType,
          subSectionType,
          gameContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to generate content");

      const reader = response.body?.getReader();
      if (!reader) return;

      editor.commands.clearContent();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        editor.commands.insertContent(chunk);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Generation error:", error);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [editor, sectionType, subSectionType, gameContext]);

  // Handle Tab key to accept suggestion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && suggestion && !e.shiftKey) {
        e.preventDefault();
        acceptSuggestion();
      } else if (e.key === "Escape" && suggestion) {
        e.preventDefault();
        dismissSuggestion();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [suggestion, acceptSuggestion, dismissSuggestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
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

      <div className="relative">
        <div
          className={cn(
            "border rounded-lg bg-background transition-colors",
            editor?.isFocused && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Ghost text suggestion */}
        {(suggestion || isLoadingSuggestion) && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {isLoadingSuggestion && !suggestion ? (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <p className="text-sm text-accent italic">{suggestion}</p>
                )}
              </div>
              {suggestion && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={acceptSuggestion}
                    className="h-6 w-6 p-0"
                    title="Accept (Tab)"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissSuggestion}
                    className="h-6 w-6 p-0"
                    title="Dismiss (Esc)"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
            {suggestion && (
              <p className="text-xs text-accent mt-1">
                Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Tab</kbd> to accept
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
