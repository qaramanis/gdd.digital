"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Wand2, Expand, Minimize2, Loader2, ChevronDown } from "lucide-react";

interface GameContext {
  name: string;
  concept: string;
  platforms: string[];
  timeline?: string;
}

interface EnhanceButtonsProps {
  sectionType: string;
  gameContext: GameContext;
  getAllContent: () => string;
  setAllContent: (content: string) => void;
}

type EnhanceAction = "enhance" | "improve" | "expand" | "concise";

const ACTIONS: { key: EnhanceAction; label: string; icon: React.ReactNode; description: string }[] = [
  {
    key: "enhance",
    label: "Enhance",
    icon: <Sparkles className="h-4 w-4" />,
    description: "Make more professional and engaging",
  },
  {
    key: "improve",
    label: "Improve",
    icon: <Wand2 className="h-4 w-4" />,
    description: "Refine clarity and impact",
  },
  {
    key: "expand",
    label: "Expand",
    icon: <Expand className="h-4 w-4" />,
    description: "Add more detail and depth",
  },
  {
    key: "concise",
    label: "Make Concise",
    icon: <Minimize2 className="h-4 w-4" />,
    description: "Shorten and tighten the text",
  },
];

export function EnhanceButtons({
  sectionType,
  gameContext,
  getAllContent,
  setAllContent,
}: EnhanceButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<EnhanceAction | null>(null);

  const handleEnhance = async (action: EnhanceAction) => {
    const content = getAllContent();
    if (!content || content.trim().length < 10) {
      return;
    }

    setIsLoading(true);
    setActiveAction(action);

    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: content,
          sectionType,
          gameContext,
        }),
      });

      if (!response.ok) throw new Error("Failed to enhance content");

      const reader = response.body?.getReader();
      if (!reader) return;

      let enhancedContent = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        enhancedContent += decoder.decode(value, { stream: true });
      }

      setAllContent(enhancedContent.trim());
    } catch (error) {
      console.error("Enhancement error:", error);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {activeAction && ACTIONS.find((a) => a.key === activeAction)?.label}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Actions
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {ACTIONS.map((action) => (
            <DropdownMenuItem
              key={action.key}
              onClick={() => handleEnhance(action.key)}
              className="flex items-start gap-2 py-2"
            >
              <span className="mt-0.5">{action.icon}</span>
              <div>
                <div className="font-medium">{action.label}</div>
                <div className="text-xs text-accent">{action.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
