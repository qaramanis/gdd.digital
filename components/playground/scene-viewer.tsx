"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Code,
  Maximize,
  RotateCcw,
  ExternalLink,
  Download,
  FileQuestion,
  Box,
} from "lucide-react";
import { ThreeJSViewer } from "./threejs-viewer";

interface SceneViewerProps {
  sceneUrl: string | null;
  fileFormat?: string | null;
  storageType?: string | null;
}

type ViewerType = "iframe" | "model" | "threejs" | "unsupported";

function getViewerType(fileFormat: string | null, storageType: string | null): ViewerType {
  // External URLs typically use iframes (Unity Play, itch.io, etc.)
  if (storageType === "external") {
    return "iframe";
  }

  const format = fileFormat?.toLowerCase().replace(".", "") || "";

  // 3D model formats - use model-viewer (GLB/GLTF)
  if (["glb", "gltf"].includes(format)) {
    return "model";
  }

  // 3D model formats - use Three.js (FBX/OBJ)
  if (["fbx", "obj"].includes(format)) {
    return "threejs";
  }

  // Web formats - use iframe
  if (["html", "htm"].includes(format)) {
    return "iframe";
  }

  // Unsupported formats
  return "unsupported";
}

function getFormatLabel(fileFormat: string | null): string {
  const format = fileFormat?.toLowerCase().replace(".", "") || "";
  switch (format) {
    case "glb":
    case "gltf":
      return "3D Model (GLTF)";
    case "fbx":
      return "3D Model (FBX)";
    case "obj":
      return "3D Model (OBJ)";
    case "html":
    case "htm":
      return "WebGL/HTML";
    case "zip":
      return "ZIP Archive";
    default:
      return format.toUpperCase() || "Unknown";
  }
}

export function SceneViewer({ sceneUrl, fileFormat, storageType }: SceneViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"view" | "code">("view");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  const viewerType = getViewerType(fileFormat ?? null, storageType ?? null);

  // Dynamically import model-viewer for 3D files
  useEffect(() => {
    if (viewerType === "model" && !modelViewerLoaded) {
      import("@google/model-viewer").then(() => {
        setModelViewerLoaded(true);
      });
    }
  }, [viewerType, modelViewerLoaded]);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenExternal = () => {
    if (sceneUrl) {
      window.open(sceneUrl, "_blank");
    }
  };

  const handleDownload = () => {
    if (sceneUrl) {
      const link = document.createElement("a");
      link.href = sceneUrl;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!sceneUrl) {
    return null;
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "view" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("view")}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant={viewMode === "code" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("code")}
          >
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
          <span className="text-xs text-muted-foreground ml-2">
            {getFormatLabel(fileFormat ?? null)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {viewerType === "iframe" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReload}
              title="Reload scene"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            title="Download file"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            title="Fullscreen"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative bg-muted/30">
        {viewMode === "view" ? (
          <>
            {viewerType === "iframe" && (
              <iframe
                ref={iframeRef}
                src={sceneUrl}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}

            {viewerType === "model" && modelViewerLoaded && (
              <div className="w-full h-full">
                {/* @ts-expect-error model-viewer is a web component */}
                <model-viewer
                  src={sceneUrl}
                  alt="3D Scene"
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            )}

            {viewerType === "model" && !modelViewerLoaded && (
              <div className="flex flex-col items-center justify-center h-full">
                <Box className="h-12 w-12 text-muted-foreground/50 mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading 3D viewer...</p>
              </div>
            )}

            {viewerType === "threejs" && (
              <ThreeJSViewer
                url={sceneUrl}
                format={(fileFormat ?? "").toLowerCase().replace(".", "")}
              />
            )}

            {viewerType === "unsupported" && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <FileQuestion className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Preview not available
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  This file format ({fileFormat || "unknown"}) cannot be previewed directly in the browser.
                  You can download the file to view it locally.
                </p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-zinc-900 text-green-400 font-mono text-sm p-4 h-full overflow-auto">
            <pre className="whitespace-pre-wrap">
              {`// Scene URL
${sceneUrl}

// File Format: ${fileFormat || "unknown"}
// Viewer Type: ${viewerType}

// Embed Code
${viewerType === "model" ? `<model-viewer
  src="${sceneUrl}"
  alt="3D Scene"
  camera-controls
  auto-rotate
  shadow-intensity="1"
  style="width: 100%; height: 400px;"
></model-viewer>

<!-- Don't forget to include the model-viewer script -->
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>` : viewerType === "threejs" ? `// Three.js is required to view FBX/OBJ files
// Install: npm install three

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ${(fileFormat ?? "").toLowerCase().includes("fbx") ? "FBXLoader" : "OBJLoader"} } from 'three/examples/jsm/loaders/${(fileFormat ?? "").toLowerCase().includes("fbx") ? "FBXLoader" : "OBJLoader"}.js';

const loader = new ${(fileFormat ?? "").toLowerCase().includes("fbx") ? "FBXLoader" : "OBJLoader"}();
loader.load('${sceneUrl}', (object) => {
  scene.add(object);
});` : `<iframe
  src="${sceneUrl}"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen
></iframe>`}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
