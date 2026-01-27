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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  ChevronLeft,
  ChevronRight,
  Box,
  X,
  Filter,
} from "lucide-react";
import {
  getPaginatedCharacters,
  createCharacter,
  deleteCharacter,
  updateCharacter,
  uploadCharacterModel,
  type Character,
} from "@/lib/actions/character-actions";
import { getGameMechanics, getCustomMechanics, type CustomMechanic } from "@/lib/actions/game-actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

interface CharacterListPageProps {
  gameId: string;
  userId: string;
}

const ITEMS_PER_PAGE = 10;

export function CharacterListPage({ gameId, userId }: CharacterListPageProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Add character state
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const [newCharacterDescription, setNewCharacterDescription] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Link mechanics modal state
  const [mechanicsModalOpen, setMechanicsModalOpen] = useState(false);
  const [mechanicsCharacter, setMechanicsCharacter] =
    useState<Character | null>(null);
  const [mechanicsOptions, setMechanicsOptions] = useState<string[]>([]);
  const [customMechanicsOptions, setCustomMechanicsOptions] = useState<CustomMechanic[]>([]);
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(false);
  const [isSavingMechanics, setIsSavingMechanics] = useState(false);

  const fetchCharacters = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasModel =
        modelFilter === "all"
          ? null
          : modelFilter === "with_model"
            ? true
            : false;

      const result = await getPaginatedCharacters({
        gameId,
        userId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        hasModel,
      });

      if (result.success) {
        setCharacters(result.characters as Character[]);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      } else {
        toast.error(result.error || "Failed to load characters");
      }
    } catch (error) {
      console.error("Error loading characters:", error);
      toast.error("Failed to load characters");
    } finally {
      setIsLoading(false);
    }
  }, [gameId, userId, currentPage, debouncedSearch, modelFilter]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, modelFilter]);

  // Fetch characters when dependencies change
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleAddCharacter = async () => {
    if (!newCharacterName.trim()) return;

    setIsSaving(true);
    try {
      const result = await createCharacter(gameId, userId, {
        name: newCharacterName.trim(),
        description: newCharacterDescription.trim() || undefined,
      });

      if (result.success) {
        setNewCharacterName("");
        setNewCharacterDescription("");
        setIsAdding(false);
        toast.success("Character added");
        // Refresh the list
        fetchCharacters();
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
        toast.success("Character deleted");
        // If we're on a page with only one item and it's not the first page, go back
        if (characters.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchCharacters();
        }
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
            c.id === editingCharacter.id ? (result.character as Character) : c
          )
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

  const clearSearch = () => {
    setSearchQuery("");
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search characters by name or description..."
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
        <Select value={modelFilter} onValueChange={setModelFilter}>
          <SelectTrigger className="w-full sm:w-48" icon={<Filter className="size-4 opacity-50" />}>
            <SelectValue placeholder="Filter by model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Characters</SelectItem>
            <SelectItem value="with_model">With 3D Model</SelectItem>
            <SelectItem value="without_model">Without 3D Model</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      {/* Add Character Form */}
      {isAdding && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Character name"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                autoFocus
                disabled={isSaving}
              />
              <Input
                placeholder="Short description (optional)"
                value={newCharacterDescription}
                onChange={(e) => setNewCharacterDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isSaving}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCharacter}
                  disabled={!newCharacterName.trim() || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewCharacterName("");
                    setNewCharacterDescription("");
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalCount === 0
            ? "No characters found"
            : `Showing ${startIndex}-${endIndex} of ${totalCount} total characters`}
        </span>
        {debouncedSearch && (
          <span>
            Search results for &quot;{debouncedSearch}&quot;
          </span>
        )}
      </div>

      {/* Character Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : characters.length === 0 ? (
        <Card className="bg-transparent border-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">No characters found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {debouncedSearch || modelFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first character"}
            </p>
            {!debouncedSearch && modelFilter === "all" && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Character
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {characters.map((character) => (
            <Card key={character.id} className="group">
              <CardContent className="">
                <div className="flex items-center justify-between gap-4">
                  {/* Name and Description */}
                  <div className="min-w-0 max-w-xl">
                    <h3 className="font-semibold truncate">{character.name}</h3>
                    <p className="text-sm text-accent truncate">
                      {character.description || "No description"}
                    </p>
                  </div>

                  {/* Right side content */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Model Status */}
                    <div className="hidden sm:flex items-center gap-2 text-sm">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      {character.modelUrl ? (
                        <span className="text-secondary">
                          3D Model
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No model</span>
                      )}
                    </div>

                    {/* Mechanics */}
                    <div className="hidden md:flex items-center gap-1 max-w-64">
                      {character.mechanics && character.mechanics.length > 0 ? (
                        <>
                          {character.mechanics.slice(0, 2).map((mechanic) => (
                            <span
                              key={mechanic}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded truncate max-w-24"
                            >
                              {mechanic}
                            </span>
                          ))}
                          {character.mechanics.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{character.mechanics.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No mechanics
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewInPlayground(character)}
                          disabled={!character.modelUrl}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View in Playground</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleLinkMechanics(character)}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Link Mechanics</TooltipContent>
                    </Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                        <DropdownMenuItem
                          onClick={() => handleLinkMechanics(character)}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Link Mechanics
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
                // Show first, last, current, and pages around current
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                );
              })
              .map((page, index, array) => {
                // Add ellipsis
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
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
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
                        }
                      );
                      if (result.success && result.character) {
                        const updatedCharacter = result.character as Character;
                        setCharacters(
                          characters.map((c) =>
                            c.id === editingCharacter.id ? updatedCharacter : c
                          )
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
              Select game mechanics related to {mechanicsCharacter?.name}. If
              you want to add a different mechanic you need to add the mechanic,
              from the Gameplay Mechanics section, to the current game first.
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
            {(mechanicsOptions.length > 0 || customMechanicsOptions.length > 0) && selectedMechanics.length > 0 && (
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
