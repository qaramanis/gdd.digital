"use client";

import { useState, useEffect } from "react";
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
import { Upload, Loader2, X, FileBox } from "lucide-react";
import { type Character } from "@/lib/actions/character-actions";

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string }) => Promise<void>;
  onUploadModel: (file: File) => Promise<void>;
  character: Character | null;
  isSaving?: boolean;
  isUploading?: boolean;
}

export function EditCharacterModal({
  isOpen,
  onClose,
  onSave,
  onUploadModel,
  character,
  isSaving = false,
  isUploading = false,
}: EditCharacterModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (character && isOpen) {
      setName(character.name);
      setDescription(character.description || "");
      setSelectedFile(null);
    }
  }, [character, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave({ name: name.trim(), description: description.trim() });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUploadModel(selectedFile);
    setSelectedFile(null);
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setSelectedFile(null);
    onClose();
  };

  const isLoading = isSaving || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Character</DialogTitle>
          <DialogDescription>
            Update the character details and upload a 3D model
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="character-name">Name</Label>
            <Input
              id="character-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="character-description">Description</Label>
            <Textarea
              id="character-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the character..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>3D Model</Label>
            {character?.modelUrl && !selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                <FileBox className="h-4 w-4 text-muted-foreground" />
                <span className="truncate flex-1">
                  {(character.modelData as { originalFileName?: string })
                    ?.originalFileName || `Model${character.fileFormat || ""}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {character.fileSize
                    ? `${(character.fileSize / 1024 / 1024).toFixed(2)} MB`
                    : ""}
                </span>
              </div>
            )}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedFile
                  ? selectedFile.name
                  : character?.modelUrl
                    ? "Drop a new model to replace"
                    : "Drop a model file here"}
              </p>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="edit-model-file-upload"
                accept=".glb,.gltf,.fbx,.obj"
                disabled={isLoading}
              />
              <label htmlFor="edit-model-file-upload">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  asChild
                  disabled={isLoading}
                >
                  <span>Choose File</span>
                </Button>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-md text-sm">
                <FileBox className="h-4 w-4" />
                <span className="truncate flex-1">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {selectedFile && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUpload}
                disabled={isLoading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Model
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
