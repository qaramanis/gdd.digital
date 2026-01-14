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
import { Upload, Link, Loader2, Play, Layers } from "lucide-react";
import { useUser } from "@/providers/user-context";
import { GameSelector } from "./game-selector";
import { SceneList } from "./scene-list";
import { SceneViewer } from "./scene-viewer";
import { toast } from "sonner";
import {
  uploadScene,
  linkExternalScene,
  type Scene,
} from "@/lib/actions/scene-actions";

export default function Playground() {
  const { userId } = useUser();
  const searchParams = useSearchParams();

  // State
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameName, setSelectedGameName] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [sceneListRefreshKey, setSceneListRefreshKey] = useState(0);

  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sceneName, setSceneName] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  // Get initial scene ID from URL params
  const initialSceneId = searchParams.get("scene");

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
    setSelectedScene(null); // Reset scene when game changes
  };

  const handleSceneSelect = (scene: Scene | null) => {
    setSelectedScene(scene);
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
        setSceneListRefreshKey((prev) => prev + 1);
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
      setSceneListRefreshKey((prev) => prev + 1);
    }

    setUploading(false);
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSceneName("");
    setSceneDescription("");
  };

  const resetLinkForm = () => {
    setExternalUrl("");
    setSceneName("");
    setSceneDescription("");
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
            />
          )}
          {/* Link External Dialog */}
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!selectedGameId}>
                <Link className="mr-2 h-4 w-4" />
                Link External Scene
              </Button>
            </DialogTrigger>
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

          {/* Upload Dialog */}
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!selectedGameId}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Scene
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Scene</DialogTitle>
                <DialogDescription>
                  Upload a WebGL build or scene file from your computer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedFile
                      ? selectedFile.name
                      : "Drag and drop your scene files here, or click to browse"}
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="playground-file-upload"
                    accept=".html,.glb,.gltf,.fbx,.obj,.zip"
                  />
                  <label htmlFor="playground-file-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>Choose Files</span>
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
                <Button
                  onClick={handleUploadScene}
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
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

      {/* Main Content */}
      <div className="flex gap-4 h-[calc(100vh-10rem)]">
        {/* Scene List Sidebar */}
        <Card className="w-64 shrink-0 overflow-hidden py-0">
          <SceneList
            gameId={selectedGameId}
            gameName={selectedGameName}
            selectedSceneId={selectedScene?.id || null}
            onSceneSelect={handleSceneSelect}
            onSceneDelete={() => setSceneListRefreshKey((prev) => prev + 1)}
            refreshKey={sceneListRefreshKey}
            initialSceneId={initialSceneId}
          />
        </Card>

        {/* Scene Viewer */}
        <Card className="flex-1 overflow-hidden py-0">
          {selectedScene ? (
            <SceneViewer
              sceneUrl={selectedScene.sceneUrl || null}
              fileFormat={selectedScene.fileFormat}
              storageType={selectedScene.storageType}
            />
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
                      scenes.
                    </p>
                  </>
                ) : (
                  <>
                    <Layers className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No scene selected
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select a scene from the sidebar or upload a new scene to
                      get started.
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
