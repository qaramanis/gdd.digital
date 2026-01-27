"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Link2,
  Upload,
  Plus,
  Trash2,
  User,
  MoreVertical,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  getCharactersByGame,
  createCharacter,
  deleteCharacter,
  updateCharacter,
  uploadCharacterModel,
  type Character,
} from "@/lib/actions/character-actions";
import { getGameMechanics, getCustomMechanics, type CustomMechanic } from "@/lib/actions/game-actions";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CharacterListProps {
  gameId: string;
  userId: string;
}

export function CharacterList({
  gameId,
  userId,
}: CharacterListProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterDescription, setNewCharacterDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Link mechanics modal state
  const [mechanicsModalOpen, setMechanicsModalOpen] = useState(false);
  const [mechanicsCharacter, setMechanicsCharacter] = useState<Character | null>(null);
  const [mechanicsOptions, setMechanicsOptions] = useState<string[]>([]);
  const [customMechanicsOptions, setCustomMechanicsOptions] = useState<CustomMechanic[]>([]);
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(false);
  const [isSavingMechanics, setIsSavingMechanics] = useState(false);

  // Load existing characters on mount
  useEffect(() => {
    async function loadCharacters() {
      setIsLoading(true);
      try {
        const result = await getCharactersByGame(gameId, userId);
        if (result.success) {
          setCharacters(result.characters as Character[]);
        } else {
          toast.error(result.error || "Failed to load characters");
        }
      } catch (error) {
        console.error("Error loading characters:", error);
        toast.error("Failed to load characters");
      } finally {
        setIsLoading(false);
      }
    }
    loadCharacters();
  }, [gameId, userId]);

  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) return;

    setIsSaving(true);
    try {
      const result = await createCharacter(gameId, userId, {
        name: newCharacterName.trim(),
        description: newCharacterDescription.trim() || undefined,
      });

      if (result.success && result.character) {
        setCharacters([result.character as Character, ...characters]);
        setNewCharacterName("");
        setNewCharacterDescription("");
        setIsAdding(false);
        toast.success("Character added");
      } else {
        toast.error(result.error || "Failed to add character");
      }
    } catch (error) {
      console.error("Error adding character:", error);
      toast.error("Failed to add character");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCharacter = async (id: string) => {
    try {
      const result = await deleteCharacter(id, userId);
      if (result.success) {
        setCharacters(characters.filter((c) => c.id !== id));
        toast.success("Character deleted");
      } else {
        toast.error(result.error || "Failed to delete character");
      }
    } catch (error) {
      console.error("Error deleting character:", error);
      toast.error("Failed to delete character");
    }
  };

  const handleLinkMechanics = async (character: Character) => {
    setMechanicsCharacter(character);
    setSelectedMechanics(character.mechanics || []);
    setMechanicsModalOpen(true);

    // Fetch available mechanics for this game (both regular and custom)
    setIsLoadingMechanics(true);
    try {
      const [mechanicsResult, customResult] = await Promise.all([
        getGameMechanics(gameId, userId),
        getCustomMechanics(gameId, userId),
      ]);

      if (mechanicsResult.success) {
        setMechanicsOptions(mechanicsResult.mechanics);
      } else {
        toast.error(mechanicsResult.error || "Failed to load mechanics");
      }

      if (customResult.success) {
        // Only show selected custom mechanics
        setCustomMechanicsOptions(customResult.mechanics.filter(m => m.isSelected));
      }
    } catch (error) {
      console.error("Error loading mechanics:", error);
      toast.error("Failed to load mechanics");
    } finally {
      setIsLoadingMechanics(false);
    }
  };

  const handleToggleMechanic = (mechanic: string) => {
    setSelectedMechanics((prev) =>
      prev.includes(mechanic)
        ? prev.filter((m) => m !== mechanic)
        : [...prev, mechanic]
    );
  };

  const handleSaveMechanics = async () => {
    if (!mechanicsCharacter) return;

    setIsSavingMechanics(true);
    try {
      const result = await updateCharacter(mechanicsCharacter.id, userId, {
        mechanics: selectedMechanics,
      });

      if (result.success && result.character) {
        setCharacters(
          characters.map((c) =>
            c.id === mechanicsCharacter.id ? (result.character as Character) : c
          )
        );
        setMechanicsModalOpen(false);
        setMechanicsCharacter(null);
        toast.success("Mechanics updated");
      } else {
        toast.error(result.error || "Failed to update mechanics");
      }
    } catch (error) {
      console.error("Error updating mechanics:", error);
      toast.error("Failed to update mechanics");
    } finally {
      setIsSavingMechanics(false);
    }
  };

  const handleViewInPlayground = (character: Character) => {
    if (!character.modelUrl) return;
    router.push(`/playground?game=${gameId}&character=${character.id}`);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setEditName(character.name);
    setEditDescription(character.description || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCharacter || !editName.trim()) return;

    setIsUpdating(true);
    try {
      const result = await updateCharacter(editingCharacter.id, userId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });

      if (result.success && result.character) {
        setCharacters(
          characters.map((c) =>
            c.id === editingCharacter.id ? (result.character as Character) : c,
          ),
        );
        setEditModalOpen(false);
        setEditingCharacter(null);
        toast.success("Character updated");
      } else {
        toast.error(result.error || "Failed to update character");
      }
    } catch (error) {
      console.error("Error updating character:", error);
      toast.error("Failed to update character");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newCharacterName.trim() && !isSaving) {
      e.preventDefault();
      handleAddCharacter();
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 bg-muted rounded-lg border border-dashed">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-muted rounded-lg border">
      <div className="flex w-full justify-between items-center text-sm text-accent mb-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>
            Characters - Displaying {Math.min(3, characters.length)} of{" "}
            {characters.length} total characters
          </span>
        </div>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Character
          </Button>
        )}
      </div>

      {/* Add new character form */}
      {isAdding && (
        <div className="flex items-center gap-2 py-2 border-b mb-2">
          <Input
            placeholder="Character name"
            value={newCharacterName}
            onChange={(e) => setNewCharacterName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-40 text-sm"
            autoFocus
            disabled={isSaving}
          />
          <Input
            placeholder="Short description"
            value={newCharacterDescription}
            onChange={(e) => setNewCharacterDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1 text-sm"
            disabled={isSaving}
          />
          <Button
            variant="default"
            size="sm"
            onClick={handleAddCharacter}
            disabled={!newCharacterName.trim() || isSaving}
            className="h-8"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              "Add"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewCharacterName("");
              setNewCharacterDescription("");
            }}
            disabled={isSaving}
            className="h-8"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Character list */}
      {characters.length === 0 && !isAdding ? (
        <p className="text-sm text-accent">No characters added yet</p>
      ) : (
        <div className="space-y-2">
          {characters.slice(0, 3).map((character) => (
            <div key={character.id} className="flex items-center justify-between gap-2 group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm w-32 truncate shrink-0">
                  {character.name}
                </span>
                <span className="text-sm text-accent truncate max-w-lg">
                  {character.description || "No description"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLinkMechanics(character)}
                      className="h-7 w-7 p-0"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-64 text-wrap text-center"
                  >
                    Link available mechanics related to this character
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewInPlayground(character)}
                      disabled={!character.modelUrl}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View in Playground
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditCharacter(character)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleRemoveCharacter(character.id)}
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

      {/* View All Section */}
      {characters.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/games/${gameId}/characters`)}
            className="w-fit text-xs text-accent"
          >
            <Eye className="h-3 w-3 mr-2" />
            View All Characters
          </Button>
        </div>
      )}

      {/* Edit Character Modal */}
      <Dialog
        open={editModalOpen}
        onOpenChange={(open) => {
          if (!open && !isUpdating && !isUploading) {
            setEditModalOpen(false);
            setEditingCharacter(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
            <DialogDescription>
              Update character details and 3D model
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Character name"
                disabled={isUpdating || isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Short description (optional)"
                disabled={isUpdating || isUploading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>3D Model</Label>
              {editingCharacter?.modelUrl ? (
                <div className="flex items-center justify-between p-3 bg-accent/5 border-muted-foreground rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-48">
                      {(
                        editingCharacter.modelData as {
                          originalFileName?: string;
                        }
                      )?.originalFileName ||
                        `Model${editingCharacter.fileFormat || ".glb"}`}
                    </span>
                  </div>
                  <label htmlFor="edit-model-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      disabled={isUploading || isUpdating}
                    >
                      <span>{isUploading ? "Uploading..." : "Replace"}</span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="border-2 border-muted-foreground/25 rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No model uploaded
                  </p>
                  <label htmlFor="edit-model-upload">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      asChild
                      disabled={isUploading || isUpdating}
                    >
                      <span>
                        {isUploading ? "Uploading..." : "Upload Model"}
                      </span>
                    </Button>
                  </label>
                </div>
              )}
              <input
                type="file"
                id="edit-model-upload"
                className="hidden"
                accept=".glb,.gltf,.fbx,.obj"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && editingCharacter) {
                    setIsUploading(true);
                    try {
                      const arrayBuffer = await file.arrayBuffer();
                      const buffer = Array.from(new Uint8Array(arrayBuffer));
                      const result = await uploadCharacterModel(
                        editingCharacter.id,
                        userId,
                        {
                          buffer,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                        },
                      );
                      if (result.success && result.character) {
                        const updatedCharacter = result.character as Character;
                        setCharacters(
                          characters.map((c) =>
                            c.id === editingCharacter.id ? updatedCharacter : c,
                          ),
                        );
                        setEditingCharacter(updatedCharacter);
                        toast.success("Model uploaded successfully");
                      } else {
                        toast.error(result.error || "Failed to upload model");
                      }
                    } catch (error) {
                      console.error("Error uploading model:", error);
                      toast.error("Failed to upload model");
                    } finally {
                      setIsUploading(false);
                      e.target.value = "";
                    }
                  }
                }}
                disabled={isUploading || isUpdating}
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: .glb, .gltf, .fbx, .obj
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setEditingCharacter(null);
              }}
              disabled={isUpdating || isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating || isUploading || !editName.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Mechanics Modal */}
      <Dialog
        open={mechanicsModalOpen}
        onOpenChange={(open) => {
          if (!open && !isSavingMechanics) {
            setMechanicsModalOpen(false);
            setMechanicsCharacter(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Mechanics</DialogTitle>
            <DialogDescription>
              Select game mechanics related to {mechanicsCharacter?.name}. If you want to add a different mechanic you need to add the mechanic, from the Gameplay Mechanics section, to the current game first.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingMechanics ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : mechanicsOptions.length === 0 && customMechanicsOptions.length === 0 ? (
              <div className="text-center py-8">
                <Link2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No mechanics available for this game.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add mechanics in the Gameplay Mechanics section first.
                </p>
              </div>
            ) : (
              <TooltipProvider>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {/* Regular Mechanics */}
                  {mechanicsOptions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Game Mechanics</h4>
                      {mechanicsOptions.map((mechanic) => (
                        <label
                          key={mechanic}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedMechanics.includes(mechanic)}
                            onCheckedChange={() => handleToggleMechanic(mechanic)}
                            disabled={isSavingMechanics}
                          />
                          <span className="text-sm">{mechanic}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Custom Mechanics */}
                  {customMechanicsOptions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        Custom Mechanics
                      </h4>
                      {customMechanicsOptions.map((mechanic) => (
                        <Tooltip key={mechanic.id}>
                          <TooltipTrigger asChild>
                            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                              <Checkbox
                                checked={selectedMechanics.includes(mechanic.name)}
                                onCheckedChange={() => handleToggleMechanic(mechanic.name)}
                                disabled={isSavingMechanics}
                              />
                              <span className="text-sm">{mechanic.name}</span>
                            </label>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{mechanic.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipProvider>
            )}
            {mechanicsOptions.length > 0 && selectedMechanics.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  Selected ({selectedMechanics.length}):
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedMechanics.map((mechanic) => (
                    <span
                      key={mechanic}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {mechanic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMechanicsModalOpen(false);
                setMechanicsCharacter(null);
              }}
              disabled={isSavingMechanics}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMechanics}
              disabled={isSavingMechanics || (mechanicsOptions.length === 0 && customMechanicsOptions.length === 0)}
            >
              {isSavingMechanics ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
