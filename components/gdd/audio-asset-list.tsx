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
  Music,
  MoreVertical,
  Pencil,
  Loader2,
  Play,
  Sparkles,
} from "lucide-react";
import {
  getAudioAssetsByGame,
  createAudioAssetWithFile,
  deleteAudioAsset,
  updateAudioAsset,
  uploadAudioFile,
  getLinkedEntities,
  type AudioAsset,
} from "@/lib/actions/audio-asset-actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { AudioPlayerModal } from "./audio-player-modal";

interface AudioAssetListProps {
  gameId: string;
  userId: string;
}

export function AudioAssetList({ gameId, userId }: AudioAssetListProps) {
  const router = useRouter();
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetDescription, setNewAssetDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AudioAsset | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingAsset, setLinkingAsset] = useState<AudioAsset | null>(null);
  const [availableCharacters, setAvailableCharacters] = useState<{ id: string; name: string }[]>([]);
  const [availableScenes, setAvailableScenes] = useState<{ id: string; name: string }[]>([]);
  const [availableMechanics, setAvailableMechanics] = useState<string[]>([]);
  const [availableCustomMechanics, setAvailableCustomMechanics] = useState<{ id: string; name: string; description: string }[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  // Listen modal state
  const [listenModalOpen, setListenModalOpen] = useState(false);
  const [listeningAsset, setListeningAsset] = useState<AudioAsset | null>(null);

  useEffect(() => {
    async function loadAudioAssets() {
      setIsLoading(true);
      try {
        const result = await getAudioAssetsByGame(gameId, userId);
        if (result.success) {
          setAudioAssets(result.audioAssets as AudioAsset[]);
        } else {
          toast.error(result.error || "Failed to load audio assets");
        }
      } catch (error) {
        console.error("Error loading audio assets:", error);
        toast.error("Failed to load audio assets");
      } finally {
        setIsLoading(false);
      }
    }
    loadAudioAssets();
  }, [gameId, userId]);

  const handleAddAudioAsset = async () => {
    if (!selectedFile) {
      toast.error("Please select an audio file");
      return;
    }

    setIsSaving(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = Array.from(new Uint8Array(arrayBuffer));

      const result = await createAudioAssetWithFile(
        gameId,
        userId,
        {
          buffer,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        },
        {
          name: newAssetName.trim() || undefined,
          description: newAssetDescription.trim() || undefined,
        }
      );

      if (result.success && result.audioAsset) {
        setAudioAssets([result.audioAsset as AudioAsset, ...audioAssets]);
        setNewAssetName("");
        setNewAssetDescription("");
        setSelectedFile(null);
        setIsAdding(false);
        toast.success("Audio asset added");
      } else {
        toast.error(result.error || "Failed to add audio asset");
      }
    } catch (error) {
      console.error("Error adding audio asset:", error);
      toast.error("Failed to add audio asset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAudioAsset = async (id: string) => {
    try {
      const result = await deleteAudioAsset(id, userId);
      if (result.success) {
        setAudioAssets(audioAssets.filter((a) => a.id !== id));
        toast.success("Audio asset deleted");
      } else {
        toast.error(result.error || "Failed to delete audio asset");
      }
    } catch (error) {
      console.error("Error deleting audio asset:", error);
      toast.error("Failed to delete audio asset");
    }
  };

  const handleLinkEntities = async (asset: AudioAsset) => {
    setLinkingAsset(asset);
    setSelectedCharacters(asset.linkedCharacters || []);
    setSelectedScenes(asset.linkedScenes || []);
    setSelectedMechanics(asset.linkedMechanics || []);
    setLinkModalOpen(true);

    setIsLoadingLinks(true);
    try {
      const result = await getLinkedEntities(gameId, userId);
      if (result.success) {
        setAvailableCharacters(result.characters || []);
        setAvailableScenes(result.scenes || []);
        setAvailableMechanics(result.mechanics || []);
        setAvailableCustomMechanics(result.customMechanics || []);
      } else {
        toast.error(result.error || "Failed to load characters and scenes");
      }
    } catch (error) {
      console.error("Error loading linked entities:", error);
      toast.error("Failed to load characters and scenes");
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleToggleCharacter = (characterId: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(characterId)
        ? prev.filter((id) => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleToggleScene = (sceneId: string) => {
    setSelectedScenes((prev) =>
      prev.includes(sceneId)
        ? prev.filter((id) => id !== sceneId)
        : [...prev, sceneId]
    );
  };

  const handleToggleMechanic = (mechanic: string) => {
    setSelectedMechanics((prev) =>
      prev.includes(mechanic)
        ? prev.filter((m) => m !== mechanic)
        : [...prev, mechanic]
    );
  };

  const handleSaveLinks = async () => {
    if (!linkingAsset) return;

    setIsSavingLinks(true);
    try {
      const result = await updateAudioAsset(linkingAsset.id, userId, {
        linkedCharacters: selectedCharacters,
        linkedScenes: selectedScenes,
        linkedMechanics: selectedMechanics,
      });

      if (result.success && result.audioAsset) {
        setAudioAssets(
          audioAssets.map((a) =>
            a.id === linkingAsset.id ? (result.audioAsset as AudioAsset) : a
          )
        );
        setLinkModalOpen(false);
        setLinkingAsset(null);
        toast.success("Links updated");
      } else {
        toast.error(result.error || "Failed to update links");
      }
    } catch (error) {
      console.error("Error updating links:", error);
      toast.error("Failed to update links");
    } finally {
      setIsSavingLinks(false);
    }
  };

  const handleEditAsset = (asset: AudioAsset) => {
    setEditingAsset(asset);
    setEditName(asset.name || "");
    setEditDescription(asset.description || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;

    setIsUpdating(true);
    try {
      const result = await updateAudioAsset(editingAsset.id, userId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });

      if (result.success && result.audioAsset) {
        setAudioAssets(
          audioAssets.map((a) =>
            a.id === editingAsset.id ? (result.audioAsset as AudioAsset) : a
          )
        );
        setEditModalOpen(false);
        setEditingAsset(null);
        toast.success("Audio asset updated");
      } else {
        toast.error(result.error || "Failed to update audio asset");
      }
    } catch (error) {
      console.error("Error updating audio asset:", error);
      toast.error("Failed to update audio asset");
    } finally {
      setIsUpdating(false);
    }
  };

  const getDisplayName = (asset: AudioAsset) => {
    return asset.name || asset.filename;
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
    <div className="p-3 bg-muted rounded-lg border overflow-hidden">
      <div className="flex w-full justify-between items-center text-sm text-accent mb-2 min-w-0">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span>
            Audio Assets - Displaying {Math.min(3, audioAssets.length)} of{" "}
            {audioAssets.length} total assets
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
            Add Audio
          </Button>
        )}
      </div>

      {/* Add new audio asset form */}
      {isAdding && (
        <div className="flex flex-col gap-2 py-2 border-b mb-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Input
              placeholder="Name (optional)"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              className="h-8 w-32 text-sm shrink-0"
              disabled={isSaving}
            />
            <Input
              placeholder="Description"
              value={newAssetDescription}
              onChange={(e) => setNewAssetDescription(e.target.value)}
              className="h-8 flex-1 text-sm min-w-0"
              disabled={isSaving}
            />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 max-w-48">
              <input
                type="file"
                id="audio-file-upload"
                className="hidden"
                accept=".mp3,.wav,.ogg,.m4a,.aac,.flac"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
                disabled={isSaving}
              />
              <label htmlFor="audio-file-upload">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={isSaving}
                  className="h-8 cursor-pointer max-w-full"
                >
                  <span className="truncate">
                    <Upload className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">{selectedFile ? selectedFile.name : "Select Audio File"}</span>
                  </span>
                </Button>
              </label>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddAudioAsset}
              disabled={!selectedFile || isSaving}
              className="h-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Uploading...
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
                setNewAssetName("");
                setNewAssetDescription("");
                setSelectedFile(null);
              }}
              disabled={isSaving}
              className="h-8"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Audio asset list */}
      {audioAssets.length === 0 && !isAdding ? (
        <p className="text-sm text-accent">No audio assets added yet</p>
      ) : (
        <div className="space-y-2">
          {audioAssets.slice(0, 3).map((asset) => (
            <div key={asset.id} className="flex items-center gap-2 group">
              <span className="font-medium text-sm w-32 truncate">
                {getDisplayName(asset)}
              </span>
              <span className="text-sm text-accent flex-1 truncate">
                {asset.description || "No description"}
              </span>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLinkEntities(asset)}
                      className="h-7 w-7 p-0"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-64 text-wrap text-center"
                  >
                    Link to characters, scenes, and mechanics
                  </TooltipContent>
                </Tooltip>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {asset.audioUrl && (
                      <DropdownMenuItem
                        onClick={() => {
                          setListeningAsset(asset);
                          setListenModalOpen(true);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Listen
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLinkEntities(asset)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleRemoveAudioAsset(asset.id)}
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
      {audioAssets.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/games/${gameId}/audio-assets`)}
            className="w-fit text-xs text-accent"
          >
            <Music className="h-3 w-3 mr-2" />
            View All Audio Assets
          </Button>
        </div>
      )}

      {/* Edit Audio Asset Modal */}
      <Dialog
        open={editModalOpen}
        onOpenChange={(open) => {
          if (!open && !isUpdating && !isUploading) {
            setEditModalOpen(false);
            setEditingAsset(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Audio Asset</DialogTitle>
            <DialogDescription>
              Update audio asset details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name (optional, uses filename if empty)"
                disabled={isUpdating || isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                disabled={isUpdating || isUploading}
                rows={3}
              />
            </div>
            {editingAsset && (
              <div className="space-y-2">
                <Label>Audio File</Label>
                <div className="flex items-center justify-between p-3 bg-accent/5 border-muted-foreground rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-48">
                      {editingAsset.filename}
                    </span>
                  </div>
                  <label htmlFor="edit-audio-upload">
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
                <input
                  type="file"
                  id="edit-audio-upload"
                  className="hidden"
                  accept=".mp3,.wav,.ogg,.m4a,.aac,.flac"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && editingAsset) {
                      setIsUploading(true);
                      try {
                        const arrayBuffer = await file.arrayBuffer();
                        const buffer = Array.from(new Uint8Array(arrayBuffer));
                        const result = await uploadAudioFile(
                          editingAsset.id,
                          userId,
                          {
                            buffer,
                            name: file.name,
                            type: file.type,
                            size: file.size,
                          }
                        );
                        if (result.success && result.audioAsset) {
                          const updatedAsset = result.audioAsset as AudioAsset;
                          setAudioAssets(
                            audioAssets.map((a) =>
                              a.id === editingAsset.id ? updatedAsset : a
                            )
                          );
                          setEditingAsset(updatedAsset);
                          toast.success("Audio file uploaded successfully");
                        } else {
                          toast.error(result.error || "Failed to upload audio file");
                        }
                      } catch (error) {
                        console.error("Error uploading audio file:", error);
                        toast.error("Failed to upload audio file");
                      } finally {
                        setIsUploading(false);
                        e.target.value = "";
                      }
                    }
                  }}
                  disabled={isUploading || isUpdating}
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: .mp3, .wav, .ogg, .m4a, .aac, .flac
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setEditingAsset(null);
              }}
              disabled={isUpdating || isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating || isUploading}
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

      {/* Link to Characters/Scenes Modal */}
      <Dialog
        open={linkModalOpen}
        onOpenChange={(open) => {
          if (!open && !isSavingLinks) {
            setLinkModalOpen(false);
            setLinkingAsset(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link to Characters, Scenes & Mechanics</DialogTitle>
            <DialogDescription>
              Select characters, scenes, and mechanics to associate with &quot;{linkingAsset ? getDisplayName(linkingAsset) : ""}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingLinks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TooltipProvider>
              <div className="space-y-6">
                {/* Characters Section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Characters</h4>
                  {availableCharacters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No characters available. Add characters in the Character Design section first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableCharacters.map((character) => (
                        <label
                          key={character.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedCharacters.includes(character.id)}
                            onCheckedChange={() => handleToggleCharacter(character.id)}
                            disabled={isSavingLinks}
                          />
                          <span className="text-sm">{character.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scenes Section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Scenes</h4>
                  {availableScenes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No scenes available. Add scenes in the Scenes section first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableScenes.map((scene) => (
                        <label
                          key={scene.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedScenes.includes(scene.id)}
                            onCheckedChange={() => handleToggleScene(scene.id)}
                            disabled={isSavingLinks}
                          />
                          <span className="text-sm">{scene.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mechanics Section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Mechanics</h4>
                  {availableMechanics.length === 0 && availableCustomMechanics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No mechanics available. Add mechanics in the Gameplay Mechanics section first.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-32 overflow-y-auto">
                      {/* Regular Mechanics */}
                      {availableMechanics.length > 0 && (
                        <div className="space-y-2">
                          {availableMechanics.map((mechanic) => (
                            <label
                              key={mechanic}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedMechanics.includes(mechanic)}
                                onCheckedChange={() => handleToggleMechanic(mechanic)}
                                disabled={isSavingLinks}
                              />
                              <span className="text-sm">{mechanic}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {/* Custom Mechanics */}
                      {availableCustomMechanics.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Custom Mechanics
                          </p>
                          {availableCustomMechanics.map((mechanic) => (
                            <Tooltip key={mechanic.id}>
                              <TooltipTrigger asChild>
                                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                                  <Checkbox
                                    checked={selectedMechanics.includes(mechanic.name)}
                                    onCheckedChange={() => handleToggleMechanic(mechanic.name)}
                                    disabled={isSavingLinks}
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
                  )}
                </div>

                {/* Selected Summary */}
                {(selectedCharacters.length > 0 || selectedScenes.length > 0 || selectedMechanics.length > 0) && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Selected: {selectedCharacters.length} character(s), {selectedScenes.length} scene(s), {selectedMechanics.length} mechanic(s)
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedCharacters.map((id) => {
                        const char = availableCharacters.find(c => c.id === id);
                        return char ? (
                          <span
                            key={id}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {char.name}
                          </span>
                        ) : null;
                      })}
                      {selectedScenes.map((id) => {
                        const scene = availableScenes.find(s => s.id === id);
                        return scene ? (
                          <span
                            key={id}
                            className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded"
                          >
                            {scene.name}
                          </span>
                        ) : null;
                      })}
                      {selectedMechanics.map((mechanic) => (
                        <span
                          key={mechanic}
                          className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded"
                        >
                          {mechanic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </TooltipProvider>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLinkModalOpen(false);
                setLinkingAsset(null);
              }}
              disabled={isSavingLinks}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLinks}
              disabled={isSavingLinks}
            >
              {isSavingLinks ? (
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

      {/* Listen Modal */}
      <AudioPlayerModal
        open={listenModalOpen}
        onOpenChange={(open) => {
          setListenModalOpen(open);
          if (!open) setListeningAsset(null);
        }}
        audioUrl={listeningAsset?.audioUrl || null}
        name={listeningAsset?.name || listeningAsset?.filename || "Audio"}
        description={listeningAsset?.description}
      />
    </div>
  );
}
