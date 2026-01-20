"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Save,
  Loader2,
  Edit2,
  Images,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { updateGameWithImage } from "@/lib/actions/game-actions";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { genres } from "@/lib/data/game-genres";

interface Game {
  id: string | number;
  name: string;
  concept?: string;
  genre?: string;
  image_url?: string;
  status?: string;
  timeline?: string;
  start_date?: string;
  completed_at?: string;
  [key: string]: any;
}

interface EditGameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedGame: Game) => Promise<void>;
  userId: string;
}

interface FormData {
  name: string;
  concept: string;
  genre: string;
  image_url: string;
  status: string;
  timeline: string;
  start_date: string;
}

interface Errors {
  [key: string]: string;
}

const EditGameModal: React.FC<EditGameModalProps> = ({
  game,
  isOpen,
  onClose,
  onSave,
  userId,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    concept: "",
    genre: "",
    image_url: "",
    status: "active",
    timeline: "",
    start_date: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (game && isOpen) {
      // Determine status from completed_at field
      const status = game.completed_at ? "completed" : "active";
      setFormData({
        name: game.name || "",
        concept: game.concept || "",
        genre: game.genre || "",
        image_url: game.image_url || "",
        status,
        timeline: game.timeline || "",
        start_date: game.start_date || "",
      });
      setImagePreview(game.image_url || "");
      setImageFile(null);
      setErrors({});
    }
  }, [game, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleGenreChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      genre: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Game title is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Game title must be less than 100 characters";
    }

    if (formData.concept && formData.concept.length > 1000) {
      newErrors.concept = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !game) {
      return;
    }

    setIsLoading(true);

    try {
      if (onSave) {
        await onSave({
          ...game,
          ...formData,
          imageFile: imageFile,
        });
        return;
      }

      let imageData:
        | { base64: string; fileName: string; contentType: string }
        | undefined;

      if (imageFile) {
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove the data URL prefix (e.g., "data:image/png;base64,")
              const base64Data = result.split(",")[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
          });
          imageData = {
            base64,
            fileName: imageFile.name,
            contentType: imageFile.type,
          };
        } catch (uploadError) {
          console.error("Image preparation error:", uploadError);
          setErrors({
            image:
              "Failed to prepare image. Changes will be saved without image update.",
          });
        }
      }

      const result = await updateGameWithImage(
        String(game.id),
        userId,
        {
          name: formData.name.trim(),
          concept: formData.concept.trim(),
          currentImageUrl: game.image_url,
        },
        imageData,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update game");
      }

      onClose();
      toast.success("Game information updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      setErrors({
        submit: error.message || "Failed to save changes. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0 px-3">
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit Game Information
          </DialogTitle>
          <DialogDescription>
            Update your game&apos;s title, description, and cover image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 px-3 overflow-y-auto flex-1">
          {/* Game Title */}
          <div className="space-y-2">
            <Label htmlFor="name">Game Title *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter game title"
              disabled={isLoading}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Game Description */}
          <div className="space-y-2">
            <Label htmlFor="concept">Description</Label>
            <Textarea
              id="concept"
              name="concept"
              value={formData.concept}
              onChange={handleInputChange}
              rows={6}
              placeholder="Enter game description or concept"
              disabled={isLoading}
              className="resize-none"
              aria-invalid={!!errors.concept}
            />
            <p className="text-xs text-accent">
              {formData.concept.length}/1000 characters
            </p>
            {errors.concept && (
              <p className="text-sm text-destructive">{errors.concept}</p>
            )}
          </div>

          {/* Game Image */}
          <div className="space-y-2">
            <Label>Game Image</Label>
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              <div className="w-28 h-28 rounded-lg border overflow-hidden bg-muted shrink-0 relative">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Game preview"
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="w-10 h-10 text-accent" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isLoading}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </span>
                  </Button>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-accent">
                  PNG, JPG, GIF up to 5MB
                </p>
                {errors.image && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Clock className="w-4 h-4" />
              Project Details
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select
                value={formData.genre}
                onValueChange={handleGenreChange}
                disabled={isLoading}
              >
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  placeholder="e.g., Q1 2025"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditGameModal;
