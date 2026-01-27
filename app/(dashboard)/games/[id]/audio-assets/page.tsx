"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchGamePageData } from "@/lib/actions/game-actions";
import { useUser } from "@/providers/user-context";
import { AudioAssetListPage } from "@/components/gdd/audio-asset-list-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Game {
  id: string;
  name: string;
  concept: string;
  genre: string;
  image_url: string;
}

export default function AudioAssetsPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [game, setGame] = useState<Game | null>(null);
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

      const gameData = await fetchGamePageData(params.id as string, userId!);

      if (gameData.error) {
        setError(gameData.error);
        return;
      }

      setGame(gameData.game as Game);
    } catch (err: any) {
      console.error("Error fetching game data:", err);
      setError(err.message || "Failed to load game data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  if (loading || userLoading || !userId) {
    return <AudioAssetsPageSkeleton />;
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

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center gap-4">
        <Link href={`/games/${game.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Game
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-3xl font-bold">{game.name} - Audio Assets</h1>
        <p className="text-muted-foreground mt-1">
          Manage all audio assets for this game
        </p>
      </div>
      <AudioAssetListPage gameId={game.id} userId={userId} />
    </div>
  );
}

function AudioAssetsPageSkeleton() {
  return (
    <div className="space-y-6 px-4">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-6 w-64" />
      </div>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64" />
        </div>
      </div>
    </div>
  );
}
