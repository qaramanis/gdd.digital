"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMechanicsByGenre, gameMechanics } from "@/lib/data/game-mechanics";
import {
  saveGameMechanics,
  getGameMechanics,
  saveCustomMechanic,
  getCustomMechanics,
  updateCustomMechanicSelection,
  deleteCustomMechanic,
  updateCustomMechanic,
  CustomMechanic,
} from "@/lib/actions/game-actions";
import {
  Lightbulb,
  Plus,
  Search,
  Save,
  Loader2,
  Check,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Interface for mechanic data exposed to parent for dynamic subsections
export interface MechanicData {
  name: string;
  description: string;
  isCustom: boolean;
}

interface SuggestedMechanicsProps {
  genre: string;
  gameId: string;
  userId: string;
  onMechanicsChange?: (selectedMechanics: string[]) => void;
  onMechanicsDataChange?: (mechanics: MechanicData[]) => void;
}

export function SuggestedMechanics({
  genre,
  gameId,
  userId,
  onMechanicsChange,
  onMechanicsDataChange,
}: SuggestedMechanicsProps) {
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
  const [savedMechanics, setSavedMechanics] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedMechanics, setTempSelectedMechanics] = useState<string[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Custom mechanics state
  const [customMechanics, setCustomMechanics] = useState<CustomMechanic[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customMechanicName, setCustomMechanicName] = useState("");
  const [customMechanicDescription, setCustomMechanicDescription] =
    useState("");
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  // Edit custom mechanics modal state
  const [isEditCustomModalOpen, setIsEditCustomModalOpen] = useState(false);
  const [editingMechanics, setEditingMechanics] = useState<CustomMechanic[]>(
    [],
  );
  const [savingMechanicIds, setSavingMechanicIds] = useState<Set<string>>(
    new Set(),
  );

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    selectedMechanics.length !== savedMechanics.length ||
    !selectedMechanics.every((m) => savedMechanics.includes(m));

  const genreMechanics = getMechanicsByGenre(genre);

  // Get mechanics from other genres (excluding current genre)
  const otherGenresMechanics = gameMechanics.filter((gm) => gm.genre !== genre);

  // Helper to get description for a mechanic name from all genres
  const getMechanicDescription = (mechanicName: string): string => {
    for (const genre of gameMechanics) {
      for (const category of genre.categories) {
        const found = category.mechanics.find((m) => m.name === mechanicName);
        if (found) return found.description;
      }
    }
    return "";
  };

  // Build mechanics data for parent component (combines predefined and custom mechanics)
  const buildMechanicsData = (
    selected: string[],
    custom: CustomMechanic[]
  ): MechanicData[] => {
    const data: MechanicData[] = [];

    // Add predefined mechanics
    for (const name of selected) {
      data.push({
        name,
        description: getMechanicDescription(name),
        isCustom: false,
      });
    }

    // Add selected custom mechanics
    for (const mechanic of custom) {
      if (mechanic.isSelected) {
        data.push({
          name: mechanic.name,
          description: mechanic.description,
          isCustom: true,
        });
      }
    }

    return data;
  };

  // Load existing mechanics on mount
  useEffect(() => {
    async function loadMechanics() {
      setIsLoading(true);
      try {
        const [mechanicsResult, customResult] = await Promise.all([
          getGameMechanics(gameId, userId),
          getCustomMechanics(gameId, userId),
        ]);

        if (mechanicsResult.success && mechanicsResult.mechanics) {
          setSelectedMechanics(mechanicsResult.mechanics);
          setSavedMechanics(mechanicsResult.mechanics);
          onMechanicsChange?.(mechanicsResult.mechanics);
        }

        if (customResult.success && customResult.mechanics) {
          setCustomMechanics(customResult.mechanics);
        }

        // Notify parent of full mechanics data for dynamic subsections
        if (mechanicsResult.success && customResult.success) {
          const mechanicsData = buildMechanicsData(
            mechanicsResult.mechanics || [],
            customResult.mechanics || []
          );
          onMechanicsDataChange?.(mechanicsData);
        }
      } catch (error) {
        console.error("Error loading mechanics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMechanics();
  }, [gameId, userId]);

  if (!genreMechanics) {
    return null;
  }

  const handleMechanicToggle = (mechanicName: string, checked: boolean) => {
    const updated = checked
      ? [...selectedMechanics, mechanicName]
      : selectedMechanics.filter((m) => m !== mechanicName);

    setSelectedMechanics(updated);
    onMechanicsChange?.(updated);
    onMechanicsDataChange?.(buildMechanicsData(updated, customMechanics));
  };

  const handleOpenModal = () => {
    // Initialize temp selection with mechanics already selected from other genres
    const otherGenreMechanicNames = otherGenresMechanics.flatMap((gm) =>
      gm.categories.flatMap((cat) => cat.mechanics.map((m) => m.name)),
    );
    const alreadySelectedFromOther = selectedMechanics.filter((m) =>
      otherGenreMechanicNames.includes(m),
    );
    setTempSelectedMechanics(alreadySelectedFromOther);
    setIsModalOpen(true);
  };

  const handleModalMechanicToggle = (
    mechanicName: string,
    checked: boolean,
  ) => {
    setTempSelectedMechanics((prev) =>
      checked
        ? [...prev, mechanicName]
        : prev.filter((m) => m !== mechanicName),
    );
  };

  const handleSaveModal = async () => {
    // Get current genre mechanic names
    const currentGenreMechanicNames = genreMechanics.categories.flatMap((cat) =>
      cat.mechanics.map((m) => m.name),
    );
    // Keep selections from current genre and add new selections from other genres
    const currentGenreSelections = selectedMechanics.filter((m) =>
      currentGenreMechanicNames.includes(m),
    );
    const updated = [...currentGenreSelections, ...tempSelectedMechanics];
    setSelectedMechanics(updated);
    onMechanicsChange?.(updated);
    onMechanicsDataChange?.(buildMechanicsData(updated, customMechanics));

    // Save to database
    setIsSaving(true);
    try {
      const result = await saveGameMechanics(gameId, userId, updated);
      if (result.success) {
        setSavedMechanics(updated);
        toast.success("Mechanics saved successfully");
      } else {
        toast.error(result.error || "Failed to save mechanics");
      }
    } catch (error) {
      console.error("Error saving mechanics:", error);
      toast.error("Failed to save mechanics");
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
      setSearchQuery("");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveGameMechanics(gameId, userId, selectedMechanics);
      if (result.success) {
        setSavedMechanics([...selectedMechanics]);
        toast.success("Mechanics saved successfully");
      } else {
        toast.error(result.error || "Failed to save mechanics");
      }
    } catch (error) {
      console.error("Error saving mechanics:", error);
      toast.error("Failed to save mechanics");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setTempSelectedMechanics([]);
    setSearchQuery("");
  };

  // Custom mechanics handlers
  const handleOpenCustomModal = () => {
    setCustomMechanicName("");
    setCustomMechanicDescription("");
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomMechanic = async () => {
    if (!customMechanicName.trim() || !customMechanicDescription.trim()) {
      toast.error("Please fill in both name and description");
      return;
    }

    setIsSavingCustom(true);
    try {
      const result = await saveCustomMechanic(
        gameId,
        userId,
        customMechanicName,
        customMechanicDescription,
      );

      if (result.success && result.mechanic) {
        const newMechanic = result.mechanic as CustomMechanic;
        const updatedCustom = [...customMechanics, newMechanic];
        setCustomMechanics(updatedCustom);
        onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, updatedCustom));
        toast.success("Custom mechanic added successfully");
        setIsCustomModalOpen(false);
        setCustomMechanicName("");
        setCustomMechanicDescription("");
      } else {
        toast.error(result.error || "Failed to add custom mechanic");
      }
    } catch (error) {
      console.error("Error saving custom mechanic:", error);
      toast.error("Failed to add custom mechanic");
    } finally {
      setIsSavingCustom(false);
    }
  };

  const handleCustomMechanicToggle = async (
    mechanicId: string,
    checked: boolean,
  ) => {
    // Optimistically update the UI
    const updatedCustom = customMechanics.map((m) =>
      m.id === mechanicId ? { ...m, isSelected: checked } : m
    );
    setCustomMechanics(updatedCustom);
    onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, updatedCustom));

    try {
      const result = await updateCustomMechanicSelection(
        gameId,
        userId,
        mechanicId,
        checked,
      );
      if (!result.success) {
        // Revert on failure
        const revertedCustom = customMechanics.map((m) =>
          m.id === mechanicId ? { ...m, isSelected: !checked } : m
        );
        setCustomMechanics(revertedCustom);
        onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, revertedCustom));
        toast.error(result.error || "Failed to update mechanic");
      }
    } catch (error) {
      console.error("Error toggling custom mechanic:", error);
      const revertedCustom = customMechanics.map((m) =>
        m.id === mechanicId ? { ...m, isSelected: !checked } : m
      );
      setCustomMechanics(revertedCustom);
      onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, revertedCustom));
      toast.error("Failed to update mechanic");
    }
  };

  const handleDeleteCustomMechanic = async (mechanicId: string) => {
    const mechanicToDelete = customMechanics.find((m) => m.id === mechanicId);

    // Optimistically remove from UI
    const updatedCustom = customMechanics.filter((m) => m.id !== mechanicId);
    setCustomMechanics(updatedCustom);
    setEditingMechanics((prev) => prev.filter((m) => m.id !== mechanicId));
    onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, updatedCustom));

    try {
      const result = await deleteCustomMechanic(gameId, userId, mechanicId);
      if (!result.success) {
        // Revert on failure
        if (mechanicToDelete) {
          const revertedCustom = [...customMechanics];
          setCustomMechanics(revertedCustom);
          setEditingMechanics((prev) => [...prev, mechanicToDelete]);
          onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, revertedCustom));
        }
        toast.error(result.error || "Failed to delete mechanic");
      } else {
        toast.success("Custom mechanic removed");
      }
    } catch (error) {
      console.error("Error deleting custom mechanic:", error);
      if (mechanicToDelete) {
        const revertedCustom = [...customMechanics];
        setCustomMechanics(revertedCustom);
        setEditingMechanics((prev) => [...prev, mechanicToDelete]);
        onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, revertedCustom));
      }
      toast.error("Failed to delete mechanic");
    }
  };

  // Edit modal handlers
  const handleOpenEditModal = () => {
    setEditingMechanics([...customMechanics]);
    setIsEditCustomModalOpen(true);
  };

  const handleEditMechanicChange = (
    mechanicId: string,
    field: "name" | "description",
    value: string,
  ) => {
    setEditingMechanics((prev) =>
      prev.map((m) => (m.id === mechanicId ? { ...m, [field]: value } : m)),
    );
  };

  const handleSaveEditedMechanic = async (mechanicId: string) => {
    const mechanic = editingMechanics.find((m) => m.id === mechanicId);
    if (!mechanic || !mechanic.name.trim() || !mechanic.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    setSavingMechanicIds((prev) => new Set([...prev, mechanicId]));
    try {
      const result = await updateCustomMechanic(gameId, userId, mechanicId, {
        name: mechanic.name,
        description: mechanic.description,
      });

      if (result.success && result.mechanic) {
        const updatedMechanic = result.mechanic as CustomMechanic;
        const updatedCustom = customMechanics.map((m) =>
          m.id === mechanicId ? updatedMechanic : m
        );
        setCustomMechanics(updatedCustom);
        onMechanicsDataChange?.(buildMechanicsData(selectedMechanics, updatedCustom));
        toast.success("Mechanic updated");
      } else {
        toast.error(result.error || "Failed to update mechanic");
      }
    } catch (error) {
      console.error("Error updating custom mechanic:", error);
      toast.error("Failed to update mechanic");
    } finally {
      setSavingMechanicIds((prev) => {
        const next = new Set(prev);
        next.delete(mechanicId);
        return next;
      });
    }
  };

  const handleCloseEditModal = () => {
    setIsEditCustomModalOpen(false);
    setEditingMechanics([]);
  };

  // Filter mechanics based on search query
  const filteredGenresMechanics = otherGenresMechanics
    .map((genreData) => ({
      ...genreData,
      categories: genreData.categories
        .map((category) => ({
          ...category,
          mechanics: category.mechanics.filter(
            (mechanic) =>
              mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              mechanic.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.mechanics.length > 0),
    }))
    .filter((genreData) => genreData.categories.length > 0);

  const formatGenreName = (genreName: string) => {
    return genreName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-muted p-4 mb-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-muted p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-secondary" />
          <h3 className="font-medium">
            Suggested Mechanics for {formatGenreName(genreMechanics.genre)}{" "}
            Games
          </h3>
        </div>
        <p className="text-base text-accent mb-4">
          Select mechanics that apply to your game. Hover over each mechanic to
          see its description.
        </p>
        <TooltipProvider>
          <div className="space-y-4">
            {genreMechanics.categories.map((category) => (
              <div key={category.category}>
                <h4 className="font-medium text-foreground mb-2">
                  {category.category}
                </h4>
                <div className="flex flex-wrap gap-4">
                  {category.mechanics.map((mechanic) => (
                    <Tooltip key={mechanic.name}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={mechanic.name}
                            checked={selectedMechanics.includes(mechanic.name)}
                            onCheckedChange={(checked) =>
                              handleMechanicToggle(
                                mechanic.name,
                                checked === true,
                              )
                            }
                          />
                          <Label
                            htmlFor={mechanic.name}
                            className={`text-sm cursor-pointer ${selectedMechanics.includes(mechanic.name) ? "text-foreground" : "text-accent"}`}
                          >
                            {mechanic.name}
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{mechanic.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        {/* Custom Mechanics Section */}
        {customMechanics.length > 0 && (
          <TooltipProvider>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                Custom Mechanics
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenEditModal}
                  className="h-6 w-6 p-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </h4>
              <div className="flex flex-wrap gap-4">
                {customMechanics.map((mechanic) => (
                  <Tooltip key={mechanic.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`custom-${mechanic.id}`}
                          checked={mechanic.isSelected}
                          onCheckedChange={(checked) =>
                            handleCustomMechanicToggle(
                              mechanic.id,
                              checked === true,
                            )
                          }
                        />
                        <Label
                          htmlFor={`custom-${mechanic.id}`}
                          className={`text-sm cursor-pointer ${mechanic.isSelected ? "text-foreground" : "text-accent"}`}
                        >
                          {mechanic.name}
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>{mechanic.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </TooltipProvider>
        )}

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleOpenCustomModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom
            </Button>
            <Button variant="ghost" size="sm" onClick={handleOpenModal}>
              <Plus className="h-4 w-4 mr-2" />
              Add from other genres
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Mechanics from Other Genres</DialogTitle>
            <DialogDescription>
              Select additional mechanics from other game genres to add to your
              game.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mechanics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-4">
            <TooltipProvider>
              <div className="space-y-6">
                {filteredGenresMechanics.map((genreData) => (
                  <div key={genreData.genre} className="space-y-3">
                    <h3 className="font-semibold text-lg border-b pb-2">
                      {formatGenreName(genreData.genre)}
                    </h3>
                    {genreData.categories.map((category) => (
                      <div
                        key={`${genreData.genre}-${category.category}`}
                        className="ml-2"
                      >
                        <h4 className="font-medium text-muted-foreground mb-2">
                          {category.category}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {category.mechanics.map((mechanic) => (
                            <Tooltip
                              key={`${genreData.genre}-${mechanic.name}`}
                            >
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`modal-${genreData.genre}-${mechanic.name}`}
                                    checked={tempSelectedMechanics.includes(
                                      mechanic.name,
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleModalMechanicToggle(
                                        mechanic.name,
                                        checked === true,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`modal-${genreData.genre}-${mechanic.name}`}
                                    className={`text-sm cursor-pointer ${tempSelectedMechanics.includes(mechanic.name) ? "text-foreground" : "text-accent"}`}
                                  >
                                    {mechanic.name}
                                  </Label>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{mechanic.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          <DialogFooter className="mt-4 flex justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setTempSelectedMechanics([])}
              disabled={tempSelectedMechanics.length === 0}
            >
              Clear
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelModal}>
                Cancel
              </Button>
              <Button onClick={handleSaveModal} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Mechanic Dialog */}
      <Dialog open={isCustomModalOpen} onOpenChange={setIsCustomModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Mechanic</DialogTitle>
            <DialogDescription>
              Create a custom mechanic specific to your game. This will only be
              visible for this game.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custom-mechanic-name">Name</Label>
              <Input
                id="custom-mechanic-name"
                placeholder="e.g., Time Rewind"
                value={customMechanicName}
                onChange={(e) => setCustomMechanicName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-mechanic-description">Description</Label>
              <Textarea
                id="custom-mechanic-description"
                placeholder="Briefly describe what this mechanic does..."
                value={customMechanicDescription}
                onChange={(e) => setCustomMechanicDescription(e.target.value)}
                rows={3}
                maxLength={200}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomModalOpen(false)}
              disabled={isSavingCustom}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCustomMechanic}
              disabled={
                isSavingCustom ||
                !customMechanicName.trim() ||
                !customMechanicDescription.trim()
              }
            >
              {isSavingCustom ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Mechanic"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Custom Mechanics Modal */}
      <Dialog
        open={isEditCustomModalOpen}
        onOpenChange={setIsEditCustomModalOpen}
      >
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Custom Mechanics</DialogTitle>
            <DialogDescription>
              Edit or delete your custom mechanics. Changes are saved
              individually.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {editingMechanics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No custom mechanics to edit.
              </p>
            ) : (
              editingMechanics.map((mechanic) => (
                <div
                  key={mechanic.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="space-y-1">
                        <Label
                          htmlFor={`edit-name-${mechanic.id}`}
                          className="text-xs"
                        >
                          Name
                        </Label>
                        <Input
                          id={`edit-name-${mechanic.id}`}
                          value={mechanic.name}
                          onChange={(e) =>
                            handleEditMechanicChange(
                              mechanic.id,
                              "name",
                              e.target.value,
                            )
                          }
                          maxLength={50}
                          disabled={savingMechanicIds.has(mechanic.id)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label
                          htmlFor={`edit-desc-${mechanic.id}`}
                          className="text-xs"
                        >
                          Description
                        </Label>
                        <Textarea
                          id={`edit-desc-${mechanic.id}`}
                          value={mechanic.description}
                          onChange={(e) =>
                            handleEditMechanicChange(
                              mechanic.id,
                              "description",
                              e.target.value,
                            )
                          }
                          rows={2}
                          maxLength={200}
                          disabled={savingMechanicIds.has(mechanic.id)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCustomMechanic(mechanic.id)}
                      disabled={savingMechanicIds.has(mechanic.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEditedMechanic(mechanic.id)}
                      disabled={
                        savingMechanicIds.has(mechanic.id) ||
                        !mechanic.name.trim() ||
                        !mechanic.description.trim()
                      }
                    >
                      {savingMechanicIds.has(mechanic.id) ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
