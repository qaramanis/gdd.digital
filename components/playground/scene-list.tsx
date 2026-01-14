"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Layers,
  Loader2,
  Globe,
  HardDrive,
  Gamepad2,
  MoreVertical,
  Download,
  ExternalLink,
  Trash2,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getScenesByGame,
  deleteScene,
  type Scene,
} from "@/lib/actions/scene-actions";
import { toast } from "sonner";

interface SceneListProps {
  gameId: string | null;
  gameName: string | null;
  selectedSceneId: string | null;
  onSceneSelect: (scene: Scene | null) => void;
  onSceneDelete?: () => void;
  refreshKey?: number;
  initialSceneId?: string | null;
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
  onSceneDelete,
  refreshKey,
  initialSceneId,
}: SceneListProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  const handleDownloadScene = async (scene: Scene) => {
    if (!scene.sceneUrl) {
      toast.error("No file available for download");
      return;
    }

    try {
      const response = await fetch(scene.sceneUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const sceneData = scene.sceneData as { originalFileName?: string } | null;
      const fileName =
        sceneData?.originalFileName || `${scene.name}${scene.fileFormat || ""}`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDeleteScene = async (scene: Scene) => {
    if (!confirm("Are you sure you want to delete this scene?")) return;

    const { error } = await deleteScene(scene.id);

    if (error) {
      toast.error("Failed to delete scene");
      console.error(error);
    } else {
      toast.success("Scene deleted");
      // Clear selection if deleted scene was selected
      if (selectedSceneId === scene.id) {
        onSceneSelect(null);
      }
      // Trigger refresh
      onSceneDelete?.();
    }
  };

  useEffect(() => {
    if (!gameId) {
      setScenes([]);
      setHasAutoSelected(false);
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

  // Auto-select scene from URL params when scenes are loaded
  useEffect(() => {
    if (
      initialSceneId &&
      scenes.length > 0 &&
      !hasAutoSelected &&
      !selectedSceneId
    ) {
      const matchingScene = scenes.find((scene) => scene.id === initialSceneId);
      if (matchingScene) {
        onSceneSelect(matchingScene);
        setHasAutoSelected(true);
      }
    }
  }, [initialSceneId, scenes, hasAutoSelected, selectedSceneId, onSceneSelect]);

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
            <div
              key={scene.id}
              className={cn(
                "w-full p-2 rounded-lg transition-colors",
                "hover:bg-muted/80",
                selectedSceneId === scene.id && "bg-muted",
              )}
            >
              <div className="flex items-start gap-2">
                <div
                  className="flex items-start gap-2 flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSceneSelect(scene)}
                >
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {scene.sceneUrl && scene.storageType !== "external" && (
                      <DropdownMenuItem
                        onClick={() => handleDownloadScene(scene)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    )}
                    {scene.sceneUrl && scene.storageType === "external" && (
                      <DropdownMenuItem
                        onClick={() => window.open(scene.sceneUrl!, "_blank")}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open External
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Metadata
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteScene(scene)}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
