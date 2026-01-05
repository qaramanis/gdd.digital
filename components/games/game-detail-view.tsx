"use client";

import { useState, useEffect, useRef } from "react";
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
import { formatDate } from "@/lib/date-utils";
import Image from "next/image";
import GameScenesList from "./game-scenes-list";
import { useUser } from "@/providers/user-context";
import { formatDistanceToNow } from "date-fns";
import EditGameModal from "./game-edit-modal";
import { GameTeamSection } from "./game-team-section";
import { toast } from "sonner";
import { updateGameWithImage, updateGameCompletionStatus } from "@/lib/actions/game-actions";
import { GDD_SECTIONS } from "@/lib/gdd/sections";
import { GDDSectionContent } from "@/lib/actions/gdd-actions";

interface GameDetailViewProps {
  game: any;
  gddSections: Record<string, GDDSectionContent>;
}

export default function GameDetailView({
  game: initialGame,
  gddSections,
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

  // Calculate GDD progress from subsections
  // Total subsections across all GDD sections
  const totalSubsections = GDD_SECTIONS.reduce(
    (sum, section) => sum + section.subSections.length,
    0
  );

  // Count completed subsections (subsections with non-empty content)
  const completedSubsections = GDD_SECTIONS.reduce((count, section) => {
    const sectionContent = gddSections[section.slug];
    if (!sectionContent) return count;

    const filledSubsections = section.subSections.filter((sub) => {
      const content = sectionContent[sub.id];
      return content && content.trim().length > 0;
    }).length;

    return count + filledSubsections;
  }, 0);

  const gddProgress = totalSubsections > 0
    ? (completedSubsections / totalSubsections) * 100
    : 0;

  // Determine status based on progress
  const isCompleted = gddProgress === 100;
  const status = isCompleted ? "Completed" : "Active";

  // Calculate days in development
  const calculateDaysInDevelopment = () => {
    if (!game.created_at) return 0;

    const startDate = new Date(game.created_at);
    const endDate = game.completed_at ? new Date(game.completed_at) : new Date();

    return Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const daysInDevelopment = calculateDaysInDevelopment();

  // Track previous completion state to detect changes
  const prevIsCompletedRef = useRef<boolean | null>(null);

  // Auto-update completion status when progress changes
  useEffect(() => {
    // Skip on initial render
    if (prevIsCompletedRef.current === null) {
      prevIsCompletedRef.current = !!game.completed_at;
      return;
    }

    const wasCompleted = prevIsCompletedRef.current;

    // Only update if completion state changed
    if (isCompleted !== wasCompleted && userId) {
      updateGameCompletionStatus(game.id, userId, isCompleted).then((result) => {
        if (result.success) {
          setGame((prev: typeof game) => ({
            ...prev,
            completed_at: result.completedAt,
          }));
        }
      });
      prevIsCompletedRef.current = isCompleted;
    }
  }, [isCompleted, game.id, userId]);

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
            <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
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
              <p className="text-accent line-clamp-2">
                {game.concept || "No concept description provided"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className={`h-4 w-4 ${isCompleted ? "text-green-500" : "text-yellow-500"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status}</div>
            <p className="text-xs text-accent">
              {daysInDevelopment} days in development
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDD Progress</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(gddProgress)}%</div>
            <p className="text-xs text-accent">
              {completedSubsections}/{totalSubsections} subsections completed
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
        {/* GDD Summary */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Game Design Document
                  </CardTitle>
                  <CardDescription>
                    {completedSubsections > 0
                      ? `${completedSubsections} of ${totalSubsections} subsections completed`
                      : "Start documenting your game"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 p-4 bg-muted/50 rounded-lg flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Progress</span>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {Math.round(gddProgress)}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(gddProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-accent">
                    {completedSubsections} of {totalSubsections} subsections completed
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/games/${game.id}/document`)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Open Game Design Document
                </Button>
              </div>
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
                onClick={() => router.push(`/games/${game.id}/document`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Edit GDD
              </Button>
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
                <Badge
                  variant="secondary"
                  className={isCompleted ? "bg-green-500 text-white" : "text-background"}
                >
                  {status}
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

      {/* Team Section */}
      <GameTeamSection gameId={game.id} userId={userId as string} />

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
