"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { createGame } from "@/lib/actions/game-actions";
import { useUser } from "@/providers/user-context";
import { toast } from "sonner";

const platforms = [
  { id: "pc", name: "PC" },
  { id: "playstation", name: "PlayStation" },
  { id: "xbox", name: "Xbox" },
  { id: "nintendo", name: "Nintendo Switch" },
  { id: "mobile", name: "Mobile" },
  { id: "vr", name: "VR/AR" },
];

const timelines = [
  { value: "1-3 months", label: "1-3 months" },
  { value: "3-6 months", label: "3-6 months" },
  { value: "6-12 months", label: "6-12 months" },
  { value: "1-2 years", label: "1-2 years" },
  { value: "2+ years", label: "2+ years" },
];

export default function NewGamePage() {
  const router = useRouter();
  const { userId } = useUser();

  const [name, setName] = useState("");
  const [concept, setConcept] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [timeline, setTimeline] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("You must be logged in to create a game");
      return;
    }

    if (!name.trim() || !concept.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createGame(
        {
          name: name.trim(),
          concept: concept.trim(),
          startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
          timeline: timeline || undefined,
          platforms: selectedPlatforms,
        },
        userId,
      );

      if (result.success && result.game) {
        toast.success("Game created successfully!");
        router.push(`/games/${result.game.id}`);
      } else {
        toast.error(result.error || "Failed to create game");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold">Create New Game</h1>
          <p className="text-sm text-muted-foreground">
            Set up your game project with basic details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>
              Enter the essential information about your game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Game Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter your game's title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concept">
                High-Level Concept <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="concept"
                className="min-h-24 resize-none"
                placeholder="A brief description of your game that captures its essence (elevator pitch)"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Development Timeline</Label>
                <Select
                  value={timeline}
                  onValueChange={setTimeline}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelines.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Platforms</CardTitle>
            <CardDescription>
              Select the platforms you're targeting for this game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => {
                const isChecked = selectedPlatforms.includes(platform.id);
                return (
                  <div
                    key={platform.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      isChecked
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted",
                      isSubmitting && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() =>
                      !isSubmitting && handlePlatformToggle(platform.id)
                    }
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        isChecked
                          ? "bg-primary border-primary"
                          : "border-input",
                      )}
                    >
                      {isChecked && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {platform.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/games")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Game"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
