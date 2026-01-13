"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, Globe, HardDrive, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getScenesByGame, type Scene } from "@/lib/actions/scene-actions";

interface SceneListProps {
  gameId: string | null;
  gameName: string | null;
  selectedSceneId: string | null;
  onSceneSelect: (scene: Scene | null) => void;
  refreshKey?: number;
}

function getFileTypeColor(fileFormat: string | null): string {
  const format = fileFormat?.toLowerCase().replace(".", "") || "";
  switch (format) {
    case "html":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "glb":
    case "gltf":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "fbx":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "obj":
      return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
    case "zip":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "json":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

function getStorageIcon(storageType: string) {
  switch (storageType) {
    case "external":
      return <Globe className="h-3 w-3" />;
    default:
      return <HardDrive className="h-3 w-3" />;
  }
}

export function SceneList({
  gameId,
  gameName,
  selectedSceneId,
  onSceneSelect,
  refreshKey,
}: SceneListProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameId) {
      setScenes([]);
      return;
    }

    let cancelled = false;

    const loadScenes = async () => {
      setLoading(true);
      const { data, error } = await getScenesByGame(gameId);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load scenes:", error);
      } else if (data) {
        setScenes(data as Scene[]);
      }

      setLoading(false);
    };

    loadScenes();

    return () => {
      cancelled = true;
    };
  }, [gameId, refreshKey]);

  // Empty state when no game is selected
  if (!gameId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Gamepad2 className="h-10 w-10 text-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Select a game to view its scenes
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state when game has no scenes
  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Layers className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium mb-1">No scenes found</p>
        <p className="text-xs text-muted-foreground">
          Upload a scene to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-medium text-sm truncate">{gameName}</h3>
        <p className="text-xs text-muted-foreground">
          {scenes.length} scene{scenes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Scene List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => onSceneSelect(scene)}
              className={cn(
                "w-full text-left p-2 rounded-lg transition-colors",
                "hover:bg-muted/80",
                selectedSceneId === scene.id && "bg-muted",
              )}
            >
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-md shrink-0 bg-muted">
                  <Layers className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{scene.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {scene.fileFormat && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          getFileTypeColor(scene.fileFormat),
                        )}
                      >
                        {scene.fileFormat}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {getStorageIcon(scene.storageType || "minio")}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
