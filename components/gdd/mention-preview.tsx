"use client";

import { cn } from "@/lib/utils";
import {
  type MentionEntityType,
  getEntityTypeLabel,
} from "@/lib/mentions/types";
import { User, Map as MapIcon, Cog, Music, Wrench } from "lucide-react";

interface MentionPreviewProps {
  name: string;
  type: MentionEntityType;
  description?: string;
}

function getEntityIcon(type: MentionEntityType) {
  switch (type) {
    case "character":
      return <User className="h-4 w-4" />;
    case "scene":
      return <MapIcon className="h-4 w-4" />;
    case "mechanic":
      return <Cog className="h-4 w-4" />;
    case "custom_mechanic":
      return <Wrench className="h-4 w-4" />;
    case "audio_asset":
      return <Music className="h-4 w-4" />;
  }
}

function getEntityBgColor(type: MentionEntityType): string {
  switch (type) {
    case "character":
      return "bg-purple-100 text-purple-700";
    case "scene":
      return "bg-green-100 text-green-700";
    case "mechanic":
      return "bg-amber-100 text-amber-700";
    case "custom_mechanic":
      return "bg-orange-100 text-orange-700";
    case "audio_asset":
      return "bg-pink-100 text-pink-700";
  }
}

export function MentionPreview({ name, type, description }: MentionPreviewProps) {
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "p-1.5 rounded",
            getEntityBgColor(type)
          )}
        >
          {getEntityIcon(type)}
        </span>
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-muted-foreground">
            {getEntityTypeLabel(type)}
          </div>
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {description}
        </p>
      )}
      <div className="text-[10px] text-muted-foreground mt-2 pt-2 ">
        Click to navigate
      </div>
    </div>
  );
}
