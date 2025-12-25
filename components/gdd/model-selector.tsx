"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getUserPreferences,
  updateUserPreferences,
  getAvailableModelsForUser,
} from "@/lib/actions/preferences-actions";
import type { AIModelId } from "@/database/drizzle/schema/preferences";
import { toast } from "sonner";

interface ModelSelectorProps {
  userId: string;
  onModelChange?: (modelId: AIModelId) => void;
}

interface ModelOption {
  id: AIModelId;
  name: string;
  provider: string;
  description: string;
  available: boolean;
}



export function ModelSelector({ userId, onModelChange }: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] =
    useState<AIModelId>("claude-sonnet");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const [prefsResult, modelsResult] = await Promise.all([
        getUserPreferences(userId),
        getAvailableModelsForUser(),
      ]);

      if (prefsResult.success && prefsResult.preferences) {
        setSelectedModel(prefsResult.preferences.preferredAiModel);
      }

      if (modelsResult.success && modelsResult.models) {
        setModels(modelsResult.models);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = async (modelId: AIModelId) => {
    if (modelId === selectedModel) return;

    setSaving(true);
    try {
      const result = await updateUserPreferences(userId, modelId);

      if (result.success) {
        setSelectedModel(modelId);
        onModelChange?.(modelId);
        toast.success("AI model updated");
      } else {
        toast.error(result.error || "Failed to update model");
      }
    } catch (error) {
      toast.error("Failed to update model");
    } finally {
      setSaving(false);
    }
  };

  const currentModel = models.find((m) => m.id === selectedModel);

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={saving}>
          <Bot className="h-3 w-3" />
          {saving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            currentModel?.name || "Select Model"
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Choose Model</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => model.available && handleSelectModel(model.id)}
            disabled={!model.available}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              !model.available && "opacity-50 cursor-not-allowed",
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">
                {model.available ? model.description : "API key not configured"}
              </span>
            </div>
            {selectedModel === model.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
