"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Loader2 } from "lucide-react";

interface UploadModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  characterName: string;
  isUploading?: boolean;
}

export function UploadModelModal({
  isOpen,
  onClose,
  onUpload,
  characterName,
  isUploading = false,
}: UploadModelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  const resetForm = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Model</DialogTitle>
          <DialogDescription>
            Upload a 3D model file for {characterName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed border-accent/25 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-accent/50" />
            <p className="mt-2 text-sm text-accent">
              {selectedFile
                ? selectedFile.name
                : "Drag and drop your model file here, or click to browse"}
            </p>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="model-file-upload"
              accept=".glb,.gltf,.fbx,.obj"
            />
            <label htmlFor="model-file-upload">
              <Button variant="outline" className="mt-4" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>File Details</Label>
              <div className="text-sm text-accent">
                <p>Name: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Type: {selectedFile.name.split(".").pop()?.toUpperCase()}</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
