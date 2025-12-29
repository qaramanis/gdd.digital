"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchGamePageData } from "@/lib/actions/game-actions";
import { getAllGDDSections, GDDSectionContent } from "@/lib/actions/gdd-actions";
import { useUser } from "@/providers/user-context";
import GameDetailView from "@/components/games/game-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Game {
  id: string;
  name: string;
  concept: string;
  image_url: string;
  sections: string[];
  start_date: string;
  timeline: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [game, setGame] = useState<Game | null>(null);
  const [gddSections, setGddSections] = useState<Record<string, GDDSectionContent>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && userId) {
      fetchGameData();
    }
  }, [params.id, userId, userLoading]);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [gameData, sectionsData] = await Promise.all([
        fetchGamePageData(params.id as string, userId!),
        getAllGDDSections(params.id as string),
      ]);

      if (gameData.error) {
        setError(gameData.error);
        return;
      }

      setGame(gameData.game as Game);
      setGddSections(sectionsData.sections || {});
    } catch (err: any) {
      console.error("Error fetching game data:", err);
      setError(err.message || "Failed to load game data");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to sign-in if no user after loading completes
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  if (loading || userLoading || !userId) {
    return <GameDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg mb-4">{error}</p>
        <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg mb-4">Game not found</p>
        <Button onClick={() => router.push("/games")}>Back to Games</Button>
      </div>
    );
  }

  return <GameDetailView game={game} gddSections={gddSections} />;
}

function GameDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
