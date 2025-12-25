"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Code,
  ZoomIn,
  ZoomOut,
  Rotate3d,
  Download,
  Upload,
} from "lucide-react";

export function SceneViewer({ sceneUrl }: { sceneUrl: string | null }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<"view" | "code">("view");

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full bg-accent/50 p-4">
      <div className="text-center max-w-md">
        <Upload className="mx-auto h-12 w-12 text-accent mb-4" />
        <h3 className="text-lg font-medium text-accent mb-2">
          No scene selected
        </h3>
        <p className="text-sm text-accent mb-4">
          Select a scene from the sidebar or upload a new scene to get started.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        {sceneUrl && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === "view" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("view")}
            >
              <Eye className="size-4 mr-2" />
              View
            </Button>
            <Button
              variant={viewMode === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("code")}
            >
              <Code className="size-4 mr-2" />
              Code
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0 h-full relative">
        {!sceneUrl ? (
          renderEmptyState()
        ) : viewMode === "view" ? (
          <div className="relative w-full h-full">
            <iframe
              ref={iframeRef}
              src={sceneUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary">
                <ZoomIn className="size-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <ZoomOut className="size-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Rotate3d className="size-4" />
              </Button>
              <Button size="sm" variant="secondary">
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-black text-green-400 font-mono text-sm p-4 h-full overflow-auto">
            {/* Scene code view */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
