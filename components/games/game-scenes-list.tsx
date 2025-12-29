"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Link,
  Play,
  Download,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Clock,
  HardDrive,
  Globe,
  Package,
  Search,
  Filter,
  MoreVertical,
  FileCode,
  Gamepad2,
  Layers,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  getScenesByGame,
  uploadScene,
  linkExternalScene,
  deleteScene,
  type Scene,
} from "@/lib/actions/scene-actions";
import { toast } from "sonner";

interface GameScenesListProps {
  gameId: string;
  userId: string;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    }
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

function getEngineColor(engine: string): string {
  switch (engine?.toLowerCase()) {
    case "unity":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "unreal":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "godot":
      return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

function getStorageIcon(storageType: string) {
  switch (storageType) {
    case "minio":
      return <HardDrive className="h-4 w-4" />;
    case "external":
      return <Globe className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
}

export default function GameScenesList({
  gameId,
  userId,
}: GameScenesListProps) {
  const router = useRouter();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [filteredScenes, setFilteredScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [engineFilter, setEngineFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  // Form states for dialogs
  const [externalUrl, setExternalUrl] = useState("");
  const [sceneName, setSceneName] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");
  const [sceneEngine, setSceneEngine] = useState<
    "unity" | "unreal" | "godot" | "custom"
  >("unity");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch scenes
  useEffect(() => {
    fetchScenes();
  }, [gameId]);

  // Filter scenes
  useEffect(() => {
    let filtered = [...scenes];

    if (searchQuery) {
      filtered = filtered.filter(
        (scene) =>
          scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          scene.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          scene.tags?.some((t) =>
            t.tag.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    if (engineFilter !== "all") {
      filtered = filtered.filter((scene) => scene.engine === engineFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((scene) => scene.status === statusFilter);
    }

    setFilteredScenes(filtered);
  }, [scenes, searchQuery, engineFilter, statusFilter]);

  const fetchScenes = async () => {
    setLoading(true);
    const { data, error } = await getScenesByGame(gameId);

    if (error) {
      toast.error("Failed to load scenes");
      console.error(error);
    } else if (data) {
      setScenes(data as Scene[]);
    }

    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSceneName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadScene = async () => {
    if (!selectedFile || !sceneName) {
      toast.error("Please select a file and enter a name");
      return;
    }

    setUploading(true);

    try {
      // Convert File to array buffer for server action
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = Array.from(new Uint8Array(arrayBuffer));

      const result = await uploadScene(
        gameId,
        {
          buffer,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        },
        {
          name: sceneName,
          description: sceneDescription,
          engine: sceneEngine,
        },
        userId,
      );

      if (result.success) {
        toast.success("Scene uploaded successfully");
        await fetchScenes();
        setShowUploadDialog(false);
        resetUploadForm();
      } else {
        toast.error("Failed to upload scene");
        console.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to upload scene");
      console.error(error);
    }

    setUploading(false);
  };

  const handleLinkExternal = async () => {
    if (!externalUrl || !sceneName) {
      toast.error("Please enter a URL and name");
      return;
    }

    setUploading(true);

    const { error } = await linkExternalScene(
      gameId,
      externalUrl,
      {
        name: sceneName,
        description: sceneDescription,
        engine: sceneEngine,
      },
      userId,
    );

    if (error) {
      toast.error("Failed to link scene");
      console.error(error);
    } else {
      toast.success("Scene linked successfully");
      await fetchScenes();
      setShowLinkDialog(false);
      resetLinkForm();
    }

    setUploading(false);
  };

  const handlePlayScene = (scene: Scene) => {
    if (scene.isPlayable && scene.sceneUrl) {
      router.push(`/playground?scene=${scene.id}&game=${gameId}`);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm("Are you sure you want to delete this scene?")) return;

    const { error } = await deleteScene(sceneId);

    if (error) {
      toast.error("Failed to delete scene");
      console.error(error);
    } else {
      toast.success("Scene deleted");
      await fetchScenes();
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setSceneName("");
    setSceneDescription("");
    setSceneEngine("unity");
  };

  const resetLinkForm = () => {
    setExternalUrl("");
    setSceneName("");
    setSceneDescription("");
    setSceneEngine("unity");
  };

  const uniqueEngines = Array.from(new Set(scenes.map((s) => s.engine)));
  const uniqueStatuses = Array.from(
    new Set(scenes.map((s) => s.status).filter((s): s is string => s !== null)),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Game Scenes</h2>
          <p className="text-accent">
            Manage and preview all scenes for your game
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Link className="mr-2 h-4 w-4" />
                Link External
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
                  <Label htmlFor="scene-url">Scene URL</Label>
                  <Input
                    id="scene-url"
                    placeholder="https://play.unity.com/..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scene-name">Scene Name</Label>
                  <Input
                    id="scene-name"
                    placeholder="My Awesome Scene"
                    value={sceneName}
                    onChange={(e) => setSceneName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scene-desc">Description (Optional)</Label>
                  <Textarea
                    id="scene-desc"
                    placeholder="Brief description of the scene..."
                    value={sceneDescription}
                    onChange={(e) => setSceneDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scene-engine">Engine</Label>
                  <Select
                    value={sceneEngine}
                    onValueChange={(v) => setSceneEngine(v as any)}
                  >
                    <SelectTrigger id="scene-engine">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unity">Unity</SelectItem>
                      <SelectItem value="unreal">Unreal Engine</SelectItem>
                      <SelectItem value="godot">Godot</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
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
                <div className="border-2 border-dashed border-accent/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-accent/50" />
                  <p className="mt-2 text-sm text-accent">
                    {selectedFile
                      ? selectedFile.name
                      : "Drag and drop your scene files here, or click to browse"}
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".html,.unity3d,.umap,.glb,.gltf,.zip"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>Choose Files</span>
                    </Button>
                  </label>
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
                    <div className="space-y-2">
                      <Label htmlFor="upload-scene-engine">Engine</Label>
                      <Select
                        value={sceneEngine}
                        onValueChange={(v) => setSceneEngine(v as any)}
                      >
                        <SelectTrigger id="upload-scene-engine">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unity">Unity</SelectItem>
                          <SelectItem value="unreal">Unreal Engine</SelectItem>
                          <SelectItem value="godot">Godot</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
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

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <Input
            placeholder="Search scenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {/*<Select value={engineFilter} onValueChange={setEngineFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Engines</SelectItem>
              {uniqueEngines.map((engine) => (
                <SelectItem key={engine} value={engine}>
                  {engine.charAt(0).toUpperCase() + engine.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>*/}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent">Total Scenes</p>
                <p className="text-2xl font-bold">{scenes.length}</p>
              </div>
              <Layers className="h-8 w-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent">Playable</p>
                <p className="text-2xl font-bold">
                  {scenes.filter((s) => s.isPlayable).length}
                </p>
              </div>
              <Gamepad2 className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent">Total Size</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(
                    scenes.reduce((acc, s) => acc + (s.fileSize || 0), 0),
                  )}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-accent">Latest Version</p>
                <p className="text-2xl font-bold">
                  v
                  {scenes.length > 0
                    ? Math.max(...scenes.map((s) => s.version || 1))
                    : 1}
                </p>
              </div>
              <FileCode className="h-8 w-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Scenes ({filteredScenes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredScenes.length === 0 ? (
              <div className="p-8 text-center">
                <Layers className="mx-auto h-12 w-12 text-accent/20" />
                <p className="mt-4 text-sm text-accent">
                  {scenes.length === 0
                    ? "No scenes found. Upload or link your first scene to get started."
                    : "No scenes match your filters."}
                </p>
              </div>
            ) : (
              filteredScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-muted">
                      {getStorageIcon(scene.storageType || "minio")}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{scene.name}</h4>
                        <Badge
                          variant="outline"
                          className={getEngineColor(scene.engine)}
                        >
                          {scene.engine}
                        </Badge>
                        {(scene.version || 1) > 1 && (
                          <Badge variant="secondary">v{scene.version}</Badge>
                        )}
                        {scene.status === "draft" && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-accent line-clamp-1">
                        {scene.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-accent">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scene.updatedAt
                            ? formatDate(typeof scene.updatedAt === "string" ? scene.updatedAt : scene.updatedAt.toISOString())
                            : "N/A"}
                        </span>
                        {scene.fileSize && (
                          <span>{formatFileSize(scene.fileSize)}</span>
                        )}
                        {scene.fileFormat && <span>{scene.fileFormat}</span>}
                      </div>
                      {scene.tags && scene.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {scene.tags.map(({ tag }) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {scene.isPlayable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayScene(scene)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {scene.isPlayable && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handlePlayScene(scene)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Play in Playground
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Metadata
                        </DropdownMenuItem>
                        {scene.bucketPath && (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        )}
                        {scene.sceneUrl && scene.storageType === "external" && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(scene.sceneUrl!, "_blank")
                            }
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open External
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteScene(scene.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
