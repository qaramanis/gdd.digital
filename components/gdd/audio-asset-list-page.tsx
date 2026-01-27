"use client";

import { useState, useEffect, useCallback } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  getPaginatedAudioAssets,
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
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

interface AudioAssetListPageProps {
  gameId: string;
  userId: string;
}

const ITEMS_PER_PAGE = 10;

export function AudioAssetListPage({ gameId, userId }: AudioAssetListPageProps) {
  const router = useRouter();
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Add audio asset state
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetDescription, setNewAssetDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<string[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  const fetchAudioAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPaginatedAudioAssets({
        gameId,
        userId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
      });

      if (result.success) {
        setAudioAssets(result.audioAssets as AudioAsset[]);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      } else {
        toast.error(result.error || "Failed to load audio assets");
      }
    } catch (error) {
      console.error("Error loading audio assets:", error);
      toast.error("Failed to load audio assets");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, userId, currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAudioAssets();
  }, [fetchAudioAssets]);

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

      if (result.success) {
        setNewAssetName("");
        setNewAssetDescription("");
        setSelectedFile(null);
        setIsAdding(false);
        toast.success("Audio asset added");
        fetchAudioAssets();
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
        toast.success("Audio asset deleted");
        if (audioAssets.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchAudioAssets();
        }
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
    setLinkModalOpen(true);

    setIsLoadingLinks(true);
    try {
      const result = await getLinkedEntities(gameId, userId);
      if (result.success) {
        setAvailableCharacters(result.characters || []);
        setAvailableScenes(result.scenes || []);
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

  const handleSaveLinks = async () => {
    if (!linkingAsset) return;

    setIsSavingLinks(true);
    try {
      const result = await updateAudioAsset(linkingAsset.id, userId, {
        linkedCharacters: selectedCharacters,
        linkedScenes: selectedScenes,
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audio assets by name, filename, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Audio Asset
        </Button>
      </div>

      {/* Add Audio Asset Form */}
      {isAdding && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Name (optional, uses filename if empty)"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="flex-1"
                  autoFocus
                  disabled={isSaving}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newAssetDescription}
                  onChange={(e) => setNewAssetDescription(e.target.value)}
                  className="flex-1"
                  disabled={isSaving}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center min-w-0">
                <div className="min-w-0 max-w-xs">
                  <input
                    type="file"
                    id="audio-file-upload-page"
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
                  <label htmlFor="audio-file-upload-page">
                    <Button
                      variant="outline"
                      asChild
                      disabled={isSaving}
                      className="cursor-pointer"
                    >
                      <span className="truncate">
                        <Upload className="h-4 w-4 mr-2 shrink-0" />
                        <span className="truncate">{selectedFile ? selectedFile.name : "Select Audio File"}</span>
                      </span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: .mp3, .wav, .ogg, .m4a, .aac, .flac
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddAudioAsset}
                    disabled={!selectedFile || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Add"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewAssetName("");
                      setNewAssetDescription("");
                      setSelectedFile(null);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalCount === 0
            ? "No audio assets found"
            : `Showing ${startIndex}-${endIndex} of ${totalCount} total audio assets`}
        </span>
        {debouncedSearch && (
          <span>
            Search results for &quot;{debouncedSearch}&quot;
          </span>
        )}
      </div>

      {/* Audio Asset Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : audioAssets.length === 0 ? (
        <Card className="bg-transparent border-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Music className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">No audio assets found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {debouncedSearch
                ? "Try adjusting your search"
                : "Get started by adding your first audio asset"}
            </p>
            {!debouncedSearch && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Audio Asset
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {audioAssets.map((asset) => (
            <Card key={asset.id} className="group">
              <CardContent className="">
                <div className="flex items-center gap-4">
                  {/* Name and Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{getDisplayName(asset)}</h3>
                    <p className="text-sm text-accent truncate">
                      {asset.description || "No description"}
                    </p>
                  </div>

                  {/* File Format */}
                  <div className="hidden sm:flex items-center gap-2 text-sm shrink-0">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {asset.fileFormat || "Audio"}
                    </span>
                  </div>

                  {/* Linked Entities */}
                  <div className="hidden md:flex items-center gap-1 shrink-0 max-w-48">
                    {(asset.linkedCharacters?.length > 0 || asset.linkedScenes?.length > 0) ? (
                      <span className="text-xs text-muted-foreground">
                        {asset.linkedCharacters?.length || 0} character(s), {asset.linkedScenes?.length || 0} scene(s)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No links
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleLinkEntities(asset)}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Link to Characters/Scenes</TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <span key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      className="w-9"
                    >
                      {page}
                    </Button>
                  </span>
                );
              })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
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
                  <label htmlFor="edit-audio-upload-page">
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
                  id="edit-audio-upload-page"
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
            <DialogTitle>Link to Characters & Scenes</DialogTitle>
            <DialogDescription>
              Select characters and scenes to associate with &quot;{linkingAsset ? getDisplayName(linkingAsset) : ""}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingLinks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
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

                {/* Selected Summary */}
                {(selectedCharacters.length > 0 || selectedScenes.length > 0) && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Selected: {selectedCharacters.length} character(s), {selectedScenes.length} scene(s)
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
                    </div>
                  </div>
                )}
              </div>
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
    </div>
  );
}
