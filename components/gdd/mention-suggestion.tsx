"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type MentionItem,
  type MentionEntityType,
  getEntityTypeLabel,
} from "@/lib/mentions/types";
import { User, Map as MapIcon, Cog, Music, Wrench } from "lucide-react";

export interface MentionSuggestionProps {
  items: MentionItem[];
  command: (item: MentionItem) => void;
}

export interface MentionSuggestionRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

function getEntityIcon(type: MentionEntityType) {
  switch (type) {
    case "character":
      return <User className="h-3.5 w-3.5" />;
    case "scene":
      return <MapIcon className="h-3.5 w-3.5" />;
    case "mechanic":
      return <Cog className="h-3.5 w-3.5" />;
    case "custom_mechanic":
      return <Wrench className="h-3.5 w-3.5" />;
    case "audio_asset":
      return <Music className="h-3.5 w-3.5" />;
  }
}

function getEntityColor(type: MentionEntityType): string {
  switch (type) {
    case "character":
      return "text-purple-600";
    case "scene":
      return "text-green-600";
    case "mechanic":
      return "text-amber-600";
    case "custom_mechanic":
      return "text-orange-600";
    case "audio_asset":
      return "text-pink-600";
  }
}

export const MentionSuggestion = forwardRef<
  MentionSuggestionRef,
  MentionSuggestionProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (props.items.length === 0) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
        No results found
      </div>
    );
  }

  // Group items by type for display
  const groupedItems: Record<MentionEntityType, MentionItem[]> = {
    character: [],
    scene: [],
    mechanic: [],
    custom_mechanic: [],
    audio_asset: [],
  };

  props.items.forEach((item) => {
    groupedItems[item.type].push(item);
  });

  // Calculate global index mapping
  let globalIndex = 0;
  const itemIndexMap = new Map<MentionItem, number>();
  const typeOrder: MentionEntityType[] = [
    "character",
    "scene",
    "mechanic",
    "custom_mechanic",
    "audio_asset",
  ];

  for (const type of typeOrder) {
    for (const item of groupedItems[type]) {
      itemIndexMap.set(item, globalIndex);
      globalIndex++;
    }
  }

  return (
    <div className="bg-popover border rounded-lg shadow-lg overflow-hidden max-h-75 overflow-y-auto">
      {typeOrder.map((type) => {
        const items = groupedItems[type];
        if (items.length === 0) return null;

        return (
          <div key={type}>
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted border-b ">
              {getEntityTypeLabel(type)}s
            </div>
            {items.map((item) => {
              const idx = itemIndexMap.get(item)!;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-200 transition-colors",
                    idx === selectedIndex && "bg-gray-200"
                  )}
                  onClick={() => selectItem(idx)}
                >
                  <span className={cn(getEntityColor(item.type))}>
                    {getEntityIcon(item.type)}
                  </span>
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

MentionSuggestion.displayName = "MentionSuggestion";
