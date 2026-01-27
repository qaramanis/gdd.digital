"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Gamepad2,
  MoreVertical,
  Download,
  ExternalLink,
  Trash2,
  Edit,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getScenesByGame,
  deleteScene,
  type Scene,
} from "@/lib/actions/scene-actions";
import {
  getCharactersByGame,
  updateCharacter,
  uploadCharacterModel,
  type Character,
} from "@/lib/actions/character-actions";
import { toast } from "sonner";
import { EditCharacterModal } from "./edit-character-modal";

interface PlaygroundSidebarProps {
  gameId: string | null;
  gameName: string | null;
  userId: string | null;
  selectedSceneId: string | null;
  selectedCharacterId: string | null;
  onSceneSelect: (scene: Scene | null) => void;
  onCharacterSelect: (character: Character | null) => void;
  onSceneDelete?: () => void;
  refreshKey?: number;
  initialSceneId?: string | null;
  initialCharacterId?: string | null;
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

export function PlaygroundSidebar({
  gameId,
  gameName,
  userId,
  selectedSceneId,
  selectedCharacterId,
  onSceneSelect,
  onCharacterSelect,
  onSceneDelete,
  refreshKey,
  initialSceneId,
  initialCharacterId,
}: PlaygroundSidebarProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loadingScenes, setLoadingScenes] = useState(false);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [hasAutoSelectedScene, setHasAutoSelectedScene] = useState(false);
  const [hasAutoSelectedCharacter, setHasAutoSelectedCharacter] =
    useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [isSavingCharacter, setIsSavingCharacter] = useState(false);
  const [isUploadingModel, setIsUploadingModel] = useState(false);

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
  };

  const handleSaveCharacter = async (data: {
    name: string;
    description: string;
  }) => {
    if (!editingCharacter || !userId) return;

    setIsSavingCharacter(true);
    const result = await updateCharacter(editingCharacter.id, userId, {
      name: data.name,
      description: data.description,
    });

    if (result.success && result.character) {
      toast.success("Character updated");
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingCharacter.id ? (result.character as Character) : c
        )
      );
      if (selectedCharacterId === editingCharacter.id) {
        onCharacterSelect(result.character as Character);
      }
      setEditingCharacter(null);
    } else {
      toast.error(result.error || "Failed to update character");
    }
    setIsSavingCharacter(false);
  };

  const handleUploadModel = async (file: File) => {
    if (!editingCharacter || !userId) return;

    setIsUploadingModel(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await uploadCharacterModel(editingCharacter.id, userId, {
        buffer: Array.from(new Uint8Array(buffer)),
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (result.success && result.character) {
        toast.success("Model uploaded");
        setCharacters((prev) =>
          prev.map((c) =>
            c.id === editingCharacter.id ? (result.character as Character) : c
          )
        );
        setEditingCharacter(result.character as Character);
        if (selectedCharacterId === editingCharacter.id) {
          onCharacterSelect(result.character as Character);
        }
      } else {
        toast.error(result.error || "Failed to upload model");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload model");
    }
    setIsUploadingModel(false);
  };

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
      if (selectedSceneId === scene.id) {
        onSceneSelect(null);
      }
      onSceneDelete?.();
    }
  };

  const handleDownloadModel = async (character: Character) => {
    if (!character.modelUrl) {
      toast.error("No model available for download");
      return;
    }

    try {
      const response = await fetch(character.modelUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const modelData = character.modelData as {
        originalFileName?: string;
      } | null;
      const fileName =
        modelData?.originalFileName ||
        `${character.name}${character.fileFormat || ".glb"}`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download model");
    }
  };

  // Load scenes
  useEffect(() => {
    if (!gameId) {
      setScenes([]);
      setHasAutoSelectedScene(false);
      return;
    }

    let cancelled = false;

    const loadScenes = async () => {
      setLoadingScenes(true);
      const { data, error } = await getScenesByGame(gameId);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load scenes:", error);
      } else if (data) {
        setScenes(data as Scene[]);
      }

      setLoadingScenes(false);
    };

    loadScenes();

    return () => {
      cancelled = true;
    };
  }, [gameId, refreshKey]);

  // Load characters
  useEffect(() => {
    if (!gameId || !userId) {
      setCharacters([]);
      setHasAutoSelectedCharacter(false);
      return;
    }

    let cancelled = false;

    const loadCharacters = async () => {
      setLoadingCharacters(true);
      const result = await getCharactersByGame(gameId, userId);

      if (cancelled) return;

      if (result.success) {
        setCharacters(result.characters as Character[]);
      }

      setLoadingCharacters(false);
    };

    loadCharacters();

    return () => {
      cancelled = true;
    };
  }, [gameId, userId, refreshKey]);

  // Auto-select scene from URL params
  useEffect(() => {
    if (
      initialSceneId &&
      scenes.length > 0 &&
      !hasAutoSelectedScene &&
      !selectedSceneId
    ) {
      const matchingScene = scenes.find((scene) => scene.id === initialSceneId);
      if (matchingScene) {
        onSceneSelect(matchingScene);
        setHasAutoSelectedScene(true);
      }
    }
  }, [
    initialSceneId,
    scenes,
    hasAutoSelectedScene,
    selectedSceneId,
    onSceneSelect,
  ]);

  // Auto-select character from URL params
  useEffect(() => {
    if (
      initialCharacterId &&
      characters.length > 0 &&
      !hasAutoSelectedCharacter &&
      !selectedCharacterId
    ) {
      const matchingCharacter = characters.find(
        (c) => c.id === initialCharacterId,
      );
      if (matchingCharacter) {
        onCharacterSelect(matchingCharacter);
        setHasAutoSelectedCharacter(true);
      }
    }
  }, [
    initialCharacterId,
    characters,
    hasAutoSelectedCharacter,
    selectedCharacterId,
    onCharacterSelect,
  ]);

  // Empty state when no game is selected
  if (!gameId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Gamepad2 className="h-10 w-10 text-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Select a game to view its scenes and models
        </p>
      </div>
    );
  }

  const isLoading = loadingScenes || loadingCharacters;

  // Loading state
  if (isLoading && scenes.length === 0 && characters.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b">
        <Link href={`/games/${gameId}`}>
          <h3 className="font-medium text-sm truncate hover:text-primary transition-colors cursor-pointer">
            {gameName || "Loading..."}
          </h3>
        </Link>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Game Scenes Section */}
        <div className="border-b">
          <div className="p-3 pb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Layers className="h-3.5 w-3.5" />
              Game Scenes
              <span className="ml-auto text-[10px] font-normal normal-case">
                {scenes.length}
              </span>
            </div>
          </div>

          {loadingScenes ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : scenes.length === 0 ? (
            <div className="px-3 pb-3">
              <p className="text-xs text-muted-foreground text-center py-4">
                No scenes available
              </p>
            </div>
          ) : (
            <div className="px-2 pb-2 space-y-1">
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
                      onClick={() => {
                        onCharacterSelect(null);
                        onSceneSelect(scene);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {scene.name}
                        </p>
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
                            onClick={() =>
                              window.open(scene.sceneUrl!, "_blank")
                            }
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
          )}
        </div>

        {/* Character Models Section */}
        <div>
          <div className="p-3 pb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <User className="h-3.5 w-3.5" />
              Character Models
              <span className="ml-auto text-[10px] font-normal normal-case">
                {characters.length}
              </span>
            </div>
          </div>

          {loadingCharacters ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : characters.length === 0 ? (
            <div className="px-3 pb-3">
              <p className="text-xs text-muted-foreground text-center py-4">
                No characters available
              </p>
            </div>
          ) : (
            <div className="px-2 pb-2 space-y-1">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={cn(
                    "w-full p-2 rounded-lg transition-colors",
                    "hover:bg-muted/80",
                    selectedCharacterId === character.id && "bg-muted",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="flex items-start gap-2 flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        onSceneSelect(null);
                        onCharacterSelect(character);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {character.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {character.modelUrl ? (
                            <>
                              {character.fileFormat && (
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0",
                                    getFileTypeColor(character.fileFormat),
                                  )}
                                >
                                  {character.fileFormat}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground"
                            >
                              no model
                            </Badge>
                          )}
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
                        {character.modelUrl && (
                          <DropdownMenuItem
                            onClick={() => handleDownloadModel(character)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleEditCharacter(character)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Character
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditCharacterModal
        isOpen={!!editingCharacter}
        onClose={() => setEditingCharacter(null)}
        onSave={handleSaveCharacter}
        onUploadModel={handleUploadModel}
        character={editingCharacter}
        isSaving={isSavingCharacter}
        isUploading={isUploadingModel}
      />
    </div>
  );
}
