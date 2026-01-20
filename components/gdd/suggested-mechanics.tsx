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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMechanicsByGenre, gameMechanics } from "@/lib/data/game-mechanics";
import { saveGameMechanics, getGameMechanics } from "@/lib/actions/game-actions";
import { Lightbulb, Plus, Search, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface SuggestedMechanicsProps {
  genre: string;
  gameId: string;
  userId: string;
  onMechanicsChange?: (selectedMechanics: string[]) => void;
}

export function SuggestedMechanics({
  genre,
  gameId,
  userId,
  onMechanicsChange,
}: SuggestedMechanicsProps) {
  const [selectedMechanics, setSelectedMechanics] = useState<string[]>([]);
  const [savedMechanics, setSavedMechanics] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedMechanics, setTempSelectedMechanics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    selectedMechanics.length !== savedMechanics.length ||
    !selectedMechanics.every((m) => savedMechanics.includes(m));

  const genreMechanics = getMechanicsByGenre(genre);

  // Get mechanics from other genres (excluding current genre)
  const otherGenresMechanics = gameMechanics.filter((gm) => gm.genre !== genre);

  // Load existing mechanics on mount
  useEffect(() => {
    async function loadMechanics() {
      setIsLoading(true);
      try {
        const result = await getGameMechanics(gameId, userId);
        if (result.success && result.mechanics) {
          setSelectedMechanics(result.mechanics);
          setSavedMechanics(result.mechanics);
          onMechanicsChange?.(result.mechanics);
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
  };

  const handleOpenModal = () => {
    // Initialize temp selection with mechanics already selected from other genres
    const otherGenreMechanicNames = otherGenresMechanics.flatMap((gm) =>
      gm.categories.flatMap((cat) => cat.mechanics.map((m) => m.name))
    );
    const alreadySelectedFromOther = selectedMechanics.filter((m) =>
      otherGenreMechanicNames.includes(m)
    );
    setTempSelectedMechanics(alreadySelectedFromOther);
    setIsModalOpen(true);
  };

  const handleModalMechanicToggle = (mechanicName: string, checked: boolean) => {
    setTempSelectedMechanics((prev) =>
      checked ? [...prev, mechanicName] : prev.filter((m) => m !== mechanicName)
    );
  };

  const handleSaveModal = async () => {
    // Get current genre mechanic names
    const currentGenreMechanicNames = genreMechanics.categories.flatMap((cat) =>
      cat.mechanics.map((m) => m.name)
    );
    // Keep selections from current genre and add new selections from other genres
    const currentGenreSelections = selectedMechanics.filter((m) =>
      currentGenreMechanicNames.includes(m)
    );
    const updated = [...currentGenreSelections, ...tempSelectedMechanics];
    setSelectedMechanics(updated);
    onMechanicsChange?.(updated);

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
              mechanic.description.toLowerCase().includes(searchQuery.toLowerCase())
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
            Suggested Mechanics for {formatGenreName(genreMechanics.genre)} Games
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
                <h4 className="font-medium text-muted-foreground mb-2">
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
                              handleMechanicToggle(mechanic.name, checked === true)
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

        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={handleOpenModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add from other genres
          </Button>
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
              Select additional mechanics from other game genres to add to your game.
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
                      <div key={`${genreData.genre}-${category.category}`} className="ml-2">
                        <h4 className="font-medium text-muted-foreground mb-2">
                          {category.category}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {category.mechanics.map((mechanic) => (
                            <Tooltip key={`${genreData.genre}-${mechanic.name}`}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`modal-${genreData.genre}-${mechanic.name}`}
                                    checked={tempSelectedMechanics.includes(mechanic.name)}
                                    onCheckedChange={(checked) =>
                                      handleModalMechanicToggle(
                                        mechanic.name,
                                        checked === true
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
    </>
  );
}
