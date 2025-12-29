"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/providers/user-context";
import { fetchUserGames } from "@/lib/actions/game-actions";
import { ViewAllGameCard } from "@/components/games/view-all-game-card";
import { ViewAllEmptyState } from "@/components/games/view-all-empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Game {
  id: string;
  name: string;
  concept: string;
  imageUrl: string | null;
  startDate: string | null;
}

export default function ViewAllGamesPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to sign-in if no user after loading completes
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  useEffect(() => {
    if (!userLoading && userId) {
      loadGames();
    }
  }, [userId, userLoading]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserGames(userId!);
      setGames(data as Game[]);
    } catch (err: any) {
      console.error("Error fetching games:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || !userId) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Games</h1>
          <p className="text-foreground">
            Browse all your game projects in one place
          </p>
        </div>
        <Button onClick={() => router.push("/new-game")}>Create Game</Button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <Button onClick={loadGames}>Try Again</Button>
        </div>
      ) : games.length === 0 ? (
        <div className="flex justify-center py-12">
          <ViewAllEmptyState />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <ViewAllGameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
