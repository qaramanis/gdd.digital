"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Link, Loader2, Play, Layers, Box, User } from "lucide-react";
import { useUser } from "@/providers/user-context";
import { GameSelector } from "./game-selector";
import { PlaygroundSidebar } from "./playground-sidebar";
import { SceneViewer } from "./scene-viewer";
import { AudioPlayer } from "./audio-player";
import { toast } from "sonner";
import { type AudioAsset } from "@/lib/actions/audio-asset-actions";
import {
  uploadScene,
  linkExternalScene,
  type Scene,
} from "@/lib/actions/scene-actions";
import {
  type Character,
  uploadCharacterModel,
  createCharacter,
} from "@/lib/actions/character-actions";

export default function Playground() {
  const { userId } = useUser();
  const searchParams = useSearchParams();

  // State
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameName, setSelectedGameName] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedAudioAsset, setSelectedAudioAsset] = useState<AudioAsset | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCharacterUploadDialog, setShowCharacterUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCharacterModel, setUploadingCharacterModel] = useState(false);

  // Unified upload type
  const [uploadType, setUploadType] = useState<"scene" | "character" | null>(null);

  // Form states for scene
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sceneName, setSceneName] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");

  // Form states for character
  const [characterName, setCharacterName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [selectedCharacterFile, setSelectedCharacterFile] = useState<File | null>(null);

  // External link
  const [externalUrl, setExternalUrl] = useState("");

  // Get initial IDs from URL params
  const initialSceneId = searchParams.get("scene");
  const initialCharacterId = searchParams.get("character");

  // Initialize from URL params
  useEffect(() => {
    const gameId = searchParams.get("game");

    if (gameId) {
      // Defer setState to avoid synchronous call during effect
      queueMicrotask(() => {
        setSelectedGameId(gameId);
      });
    }
  }, [searchParams]);

  const handleGameChange = (gameId: string | null, gameName: string | null) => {
    setSelectedGameId(gameId);
    setSelectedGameName(gameName);
    setSelectedScene(null);
    setSelectedCharacter(null);
    setSelectedAudioAsset(null);
  };

  const handleGameNameSync = (gameName: string) => {
    setSelectedGameName(gameName);
  };

  const handleSceneSelect = (scene: Scene | null) => {
    setSelectedScene(scene);
    if (scene) {
      setSelectedCharacter(null);
      setSelectedAudioAsset(null);
    }
  };

  const handleCharacterSelect = (character: Character | null) => {
    setSelectedCharacter(character);
    if (character) {
      setSelectedScene(null);
      setSelectedAudioAsset(null);
    }
  };

  const handleAudioAssetSelect = (audioAsset: AudioAsset | null) => {
    setSelectedAudioAsset(audioAsset);
    if (audioAsset) {
      setSelectedScene(null);
      setSelectedCharacter(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSceneName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadScene = async () => {
    if (!selectedFile || !sceneName || !selectedGameId || !userId) {
      toast.error("Please select a game and file");
      return;
    }

    setUploading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = Array.from(new Uint8Array(arrayBuffer));

      const result = await uploadScene(
        selectedGameId,
        {
          buffer,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        },
        {
          name: sceneName,
          description: sceneDescription,
        },
        userId,
      );

      if (result.success) {
        toast.success("Scene uploaded successfully");
        setShowUploadDialog(false);
        resetUploadForm();
        // Trigger scene list refresh
        setSidebarRefreshKey((prev) => prev + 1);
      } else {
        toast.error("Failed to upload scene");
      }
    } catch (error) {
      toast.error("Failed to upload scene");
      console.error(error);
    }

    setUploading(false);
  };

  const handleLinkExternal = async () => {
    if (!externalUrl || !sceneName || !selectedGameId || !userId) {
      toast.error("Please select a game and enter URL");
      return;
    }

    setUploading(true);

    const { error } = await linkExternalScene(
      selectedGameId,
      externalUrl,
      {
        name: sceneName,
        description: sceneDescription,
      },
      userId,
    );

    if (error) {
      toast.error("Failed to link scene");
    } else {
      toast.success("Scene linked successfully");
      setShowLinkDialog(false);
      resetLinkForm();
      // Trigger scene list refresh
      setSidebarRefreshKey((prev) => prev + 1);
    }

    setUploading(false);
  };

  const resetUploadForm = () => {
    setUploadType(null);
    setSelectedFile(null);
    setSceneName("");
    setSceneDescription("");
    setCharacterName("");
    setCharacterDescription("");
    setSelectedCharacterFile(null);
  };

  const resetLinkForm = () => {
    setExternalUrl("");
    setSceneName("");
    setSceneDescription("");
  };

  const handleCharacterFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedCharacterFile(file);
    }
  };

  // Upload a model to an existing character (from the "no model" view)
  const handleUploadCharacterModel = async () => {
    if (!selectedCharacterFile || !selectedCharacter || !userId) {
      toast.error("Please select a file");
      return;
    }

    setUploadingCharacterModel(true);

    try {
      const arrayBuffer = await selectedCharacterFile.arrayBuffer();
      const buffer = Array.from(new Uint8Array(arrayBuffer));

      const result = await uploadCharacterModel(
        selectedCharacter.id,
        userId,
        {
          buffer,
          name: selectedCharacterFile.name,
          type: selectedCharacterFile.type,
          size: selectedCharacterFile.size,
        }
      );

      if (result.success && result.character) {
        toast.success("Model uploaded successfully");
        setShowCharacterUploadDialog(false);
        setSelectedCharacterFile(null);
        // Update selected character with the new model data
        setSelectedCharacter(result.character as Character);
        // Trigger sidebar refresh
        setSidebarRefreshKey((prev) => prev + 1);
      } else {
        toast.error(result.error || "Failed to upload model");
      }
    } catch (error) {
      toast.error("Failed to upload model");
      console.error(error);
    }

    setUploadingCharacterModel(false);
  };

  // Create a new character and upload its model
  const handleUploadNewCharacter = async () => {
    if (!characterName.trim() || !selectedCharacterFile || !selectedGameId || !userId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);

    try {
      // First create the character
      const createResult = await createCharacter(selectedGameId, userId, {
        name: characterName.trim(),
        description: characterDescription.trim() || undefined,
      });

      if (!createResult.success || !createResult.character) {
        toast.error(createResult.error || "Failed to create character");
        setUploading(false);
        return;
      }

      // Then upload the model
      const arrayBuffer = await selectedCharacterFile.arrayBuffer();
      const buffer = Array.from(new Uint8Array(arrayBuffer));

      const uploadResult = await uploadCharacterModel(
        createResult.character.id,
        userId,
        {
          buffer,
          name: selectedCharacterFile.name,
          type: selectedCharacterFile.type,
          size: selectedCharacterFile.size,
        }
      );

      if (uploadResult.success && uploadResult.character) {
        toast.success("Character created successfully");
        setShowUploadDialog(false);
        resetUploadForm();
        // Select the new character
        setSelectedCharacter(uploadResult.character as Character);
        setSelectedScene(null);
        // Trigger sidebar refresh
        setSidebarRefreshKey((prev) => prev + 1);
      } else {
        // Character was created but model upload failed
        toast.error(uploadResult.error || "Character created but model upload failed");
        setSidebarRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      toast.error("Failed to create character");
      console.error(error);
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Playground</h1>
        </div>

        <div className="flex items-center gap-2">
          {userId && (
            <GameSelector
              userId={userId}
              selectedGameId={selectedGameId}
              onGameChange={handleGameChange}
              onGameNameSync={handleGameNameSync}
            />
          )}
          {/* Link External Dialog */}
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            {/*<DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!selectedGameId}>
                <Link className="mr-2 h-4 w-4" />
                Link External Scene
              </Button>
            </DialogTrigger>*/}
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link External Scene</DialogTitle>
                <DialogDescription>
                  Add a scene hosted on Unity Play, Itch.io, or other platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="external-url">Scene URL</Label>
                  <Input
                    id="external-url"
                    placeholder="https://play.unity.com/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-scene-name">Scene Name</Label>
                  <Input
                    id="link-scene-name"
                    placeholder="My Awesome Scene"
                    value={sceneName}
                    onChange={(e) => setSceneName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-scene-desc">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="link-scene-desc"
                    placeholder="Brief description..."
                    value={sceneDescription}
                    onChange={(e) => setSceneDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLinkDialog(false);
                    resetLinkForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleLinkExternal} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    "Add Scene"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Unified Upload Dialog */}
          <Dialog
            open={showUploadDialog}
            onOpenChange={(open) => {
              setShowUploadDialog(open);
              if (!open) resetUploadForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" disabled={!selectedGameId}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload</DialogTitle>
                <DialogDescription>
                  Upload a game scene or character model
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Upload Type Selector */}
                <div className="space-y-2">
                  <Label>What would you like to upload?</Label>
                  <Select
                    value={uploadType || ""}
                    onValueChange={(value) => setUploadType(value as "scene" | "character")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select upload type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scene">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          Game Scene
                        </div>
                      </SelectItem>
                      <SelectItem value="character">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Character Model
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Scene Upload Form */}
                {uploadType === "scene" && (
                  <>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to select a scene file"}
                      </p>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="playground-file-upload"
                        accept=".html,.glb,.gltf,.fbx,.obj,.zip"
                      />
                      <label htmlFor="playground-file-upload">
                        <Button variant="outline" size="sm" className="mt-3" asChild>
                          <span>Choose File</span>
                        </Button>
                      </label>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Supported: .glb, .gltf, .fbx, .obj, .html, .zip
                      </p>
                    </div>

                    {selectedFile && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="upload-scene-name">Scene Name</Label>
                          <Input
                            id="upload-scene-name"
                            placeholder="Scene name"
                            value={sceneName}
                            onChange={(e) => setSceneName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="upload-scene-desc">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id="upload-scene-desc"
                            placeholder="Brief description..."
                            value={sceneDescription}
                            onChange={(e) => setSceneDescription(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Character Upload Form */}
                {uploadType === "character" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="character-name">Character Name *</Label>
                      <Input
                        id="character-name"
                        placeholder="e.g. Main Hero, Enemy Boss"
                        value={characterName}
                        onChange={(e) => setCharacterName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="character-desc">Description (Optional)</Label>
                      <Textarea
                        id="character-desc"
                        placeholder="Brief description of the character..."
                        value={characterDescription}
                        onChange={(e) => setCharacterDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>3D Model *</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Box className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedCharacterFile
                            ? selectedCharacterFile.name
                            : "Click to select a model file"}
                        </p>
                        <input
                          type="file"
                          onChange={handleCharacterFileSelect}
                          className="hidden"
                          id="character-model-upload-new"
                          accept=".glb,.gltf,.fbx,.obj"
                        />
                        <label htmlFor="character-model-upload-new">
                          <Button variant="outline" size="sm" className="mt-3" asChild>
                            <span>Choose File</span>
                          </Button>
                        </label>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Supported: .glb, .gltf, .fbx, .obj
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadDialog(false);
                    resetUploadForm();
                  }}
                >
                  Cancel
                </Button>
                {uploadType === "scene" && (
                  <Button
                    onClick={handleUploadScene}
                    disabled={uploading || !selectedFile || !sceneName.trim()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Scene"
                    )}
                  </Button>
                )}
                {uploadType === "character" && (
                  <Button
                    onClick={handleUploadNewCharacter}
                    disabled={uploading || !selectedCharacterFile || !characterName.trim()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Character"
                    )}
                  </Button>
                )}
                {!uploadType && (
                  <Button disabled>
                    Upload
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <Card className="w-64 shrink-0 overflow-hidden py-0">
          <PlaygroundSidebar
            gameId={selectedGameId}
            gameName={selectedGameName}
            userId={userId}
            selectedSceneId={selectedScene?.id || null}
            selectedCharacterId={selectedCharacter?.id || null}
            selectedAudioAssetId={selectedAudioAsset?.id || null}
            onSceneSelect={handleSceneSelect}
            onCharacterSelect={handleCharacterSelect}
            onAudioAssetSelect={handleAudioAssetSelect}
            onSceneDelete={() => setSidebarRefreshKey((prev) => prev + 1)}
            refreshKey={sidebarRefreshKey}
            initialSceneId={initialSceneId}
            initialCharacterId={initialCharacterId}
          />
        </Card>

        {/* Viewer */}
        <Card className="flex-1 overflow-hidden py-0">
          {selectedAudioAsset && selectedAudioAsset.audioUrl ? (
            <AudioPlayer
              audioUrl={selectedAudioAsset.audioUrl}
              name={selectedAudioAsset.name || selectedAudioAsset.filename}
              description={selectedAudioAsset.description}
              fileFormat={selectedAudioAsset.fileFormat}
            />
          ) : selectedScene ? (
            <SceneViewer
              sceneUrl={selectedScene.sceneUrl || null}
              fileFormat={selectedScene.fileFormat}
              storageType={selectedScene.storageType}
            />
          ) : selectedCharacter && selectedCharacter.modelUrl ? (
            <SceneViewer
              sceneUrl={selectedCharacter.modelUrl}
              fileFormat={selectedCharacter.fileFormat}
              storageType={selectedCharacter.storageType}
            />
          ) : selectedCharacter && !selectedCharacter.modelUrl ? (
            <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-8">
              <div className="text-center max-w-md">
                <Box className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No model uploaded
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The character &quot;{selectedCharacter.name}&quot; has no 3D model uploaded yet.
                </p>
                <Dialog open={showCharacterUploadDialog} onOpenChange={setShowCharacterUploadDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Model
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Character Model</DialogTitle>
                      <DialogDescription>
                        Upload a 3D model file for &quot;{selectedCharacter.name}&quot;
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedCharacterFile
                            ? selectedCharacterFile.name
                            : "Drag and drop your model file here, or click to browse"}
                        </p>
                        <input
                          type="file"
                          onChange={handleCharacterFileSelect}
                          className="hidden"
                          id="character-model-upload"
                          accept=".glb,.gltf,.fbx,.obj"
                        />
                        <label htmlFor="character-model-upload">
                          <Button variant="outline" className="mt-4" asChild>
                            <span>Choose File</span>
                          </Button>
                        </label>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Supported: .glb, .gltf, .fbx, .obj
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCharacterUploadDialog(false);
                          setSelectedCharacterFile(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUploadCharacterModel}
                        disabled={uploadingCharacterModel || !selectedCharacterFile}
                      >
                        {uploadingCharacterModel ? (
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
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-8">
              <div className="text-center max-w-md">
                {!selectedGameId ? (
                  <>
                    <Play className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Welcome to Playground
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select a game from the dropdown above to view and play its
                      scenes and models.
                    </p>
                  </>
                ) : (
                  <>
                    <Layers className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No item selected
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select a scene or character model from the sidebar to view
                      it here.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
