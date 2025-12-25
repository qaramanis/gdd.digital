"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  FileText,
  Gamepad2,
  Play,
  CheckCircle,
  LayoutGrid,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/progress";
import { formatDate } from "@/lib/date-utils";
import Image from "next/image";
import GameScenesList from "./game-scenes-list";
import { useUser } from "@/providers/user-context";
import { formatDistanceToNow } from "date-fns";
import { ShareDocumentDialog } from "../collaboration/share-document-dialog";
import EditGameModal from "./game-edit-modal";
import { toast } from "sonner";
import { updateGameWithImage } from "@/lib/actions/game-actions";

interface GameDetailViewProps {
  game: any;
  document: any;
  sections: any[];
}

export default function GameDetailView({
  game: initialGame,
  document,
  sections,
}: GameDetailViewProps) {
  const router = useRouter();
  const { userId } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState(initialGame);

  const handleSaveGame = async (updatedGame: any) => {
    setLoading(true);

    try {
      let imageData:
        | { base64: string; fileName: string; contentType: string }
        | undefined;

      if (updatedGame.imageFile) {
        const file = updatedGame.imageFile;
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        imageData = {
          base64,
          fileName: file.name,
          contentType: file.type,
        };
      }

      const result = await updateGameWithImage(
        game.id,
        userId as string,
        {
          name: updatedGame.name,
          concept: updatedGame.concept,
          currentImageUrl: game.image_url,
        },
        imageData,
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update game");
      }

      setGame({
        ...result.game,
        image_url: result.game?.imageUrl,
        created_at: result.game?.createdAt,
        updated_at: result.game?.updatedAt,
      });

      toast.success("Game information updated successfully!");
      setIsEditModalOpen(false);
    } catch (error: any) {
      console.error("Error saving game:", error);
      toast.error(error.message || "Failed to save game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate document progress
  const totalSections = sections.length;
  const completedSections = sections.filter(
    (s) => s.content && s.content.length > 50,
  ).length;
  const documentProgress =
    totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  // Calculate days since start
  const daysSinceStart = game.start_date
    ? Math.floor(
        (new Date().getTime() - new Date(game.start_date).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/games")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditModalOpen(true)}
          className="gap-2"
          disabled={loading}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Game Info Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
              {game.image_url && game.image_url !== "/game-placeholder.jpg" ? (
                <Image
                  fill
                  sizes="96px"
                  src={game.image_url}
                  alt={game.name}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <Gamepad2 className="h-10 w-10 text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-2">{game.name}</h1>
              <p className="text-accent mb-4 line-clamp-2">
                {game.concept || "No concept description provided"}
              </p>
              <div className="flex flex-wrap gap-2">
                {game.platforms?.map((platform: string) => (
                  <Badge key={platform} variant="secondary">
                    {platform.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-accent">
              {daysSinceStart} days in development
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(documentProgress)}%
            </div>
            <p className="text-xs text-accent">
              {completedSections}/{totalSections} sections complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{game.timeline || "N/A"}</div>
            <p className="text-xs text-accent">
              Started {game.start_date ? formatDate(game.start_date) : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDistanceToNow(new Date(game.updated_at), {
                addSuffix: true,
              })}
            </div>
            <p className="text-xs text-accent">{formatDate(game.updated_at)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Summary */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Game Design Document
                  </CardTitle>
                  <CardDescription>
                    {document
                      ? `Created ${formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}`
                      : "No document created yet"}
                  </CardDescription>
                </div>
                {document && (
                  <div className="flex gap-2">
                    <ShareDocumentDialog
                      documentId={document.id}
                      documentTitle={document.title}
                      userId={userId as string}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/editor/${document.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {document ? (
                <div className="space-y-6">
                  {/* Progress Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Completion</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">
                        {Math.round(documentProgress)}%
                      </div>
                      <Progress value={documentProgress} className="h-2" />
                      <p className="text-xs text-accent mt-2">
                        {completedSections} of {totalSections} sections
                        completed
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <LayoutGrid className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Sections</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">
                        {totalSections}
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="secondary" className="text-xs">
                          {completedSections} complete
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {totalSections - completedSections} in progress
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Recent Sections */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Document Sections
                    </h4>
                    <div className="space-y-2">
                      {sections.slice(0, 5).map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => router.push(`/editor/${document.id}`)}
                        >
                          <span className="text-sm truncate flex-1">
                            {section.title}
                          </span>
                          {section.content && section.content.length > 50 ? (
                            <Badge variant="secondary" className="text-xs ml-2">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs ml-2">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      ))}
                      {sections.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => router.push(`/editor/${document.id}`)}
                        >
                          View all {sections.length} sections
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <DocumentEmptyState />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/games/${game.id}/gdd`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Edit GDD
              </Button>
              {document && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push(`/editor/${document.id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Document
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/playground?game=${game.id}`)}
              >
                <Play className="h-4 w-4 mr-2" />
                Open Playground
              </Button>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-accent">Created</span>
                <span>{formatDate(game.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-accent">Last Modified</span>
                <span>{formatDate(game.updated_at)}</span>
              </div>
              {game.timeline && (
                <div className="flex justify-between">
                  <span className="text-accent">Timeline</span>
                  <span>{game.timeline}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-accent">Status</span>
                <Badge variant="secondary" className="text-background">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scenes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Game Scenes
          </CardTitle>
          <CardDescription>Upload and manage your game scenes</CardDescription>
        </CardHeader>
        <CardContent>
          <GameScenesList gameId={game.id} userId={userId as string} />
        </CardContent>
      </Card>

      {/* Edit Game Modal */}
      <EditGameModal
        game={game}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveGame}
        userId={userId as string}
      />
    </div>
  );
}

function DocumentEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-transparent rounded-lg">
      <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-accent" />
      </div>
      <p className="text-lg font-medium mb-2">No Document Found</p>
      <p className="text-sm text-accent text-center max-w-sm">
        There is no document available for this game.
        <br /> If you think this is a mistake, try refreshing the page.
      </p>
    </div>
  );
}
