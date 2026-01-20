"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ChevronDown,
  Loader2,
  Gamepad2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchUserGames } from "@/lib/actions/game-actions";
import Image from "next/image";

interface GameSelectorProps {
  userId: string;
  selectedGameId: string | null;
  onGameChange: (gameId: string | null, gameName: string | null) => void;
  onGameNameSync?: (gameName: string) => void;
}

interface GameOption {
  id: string;
  name: string;
  imageUrl: string | null;
  concept: string;
}

export function GameSelector({
  userId,
  selectedGameId,
  onGameChange,
  onGameNameSync,
}: GameSelectorProps) {
  const [games, setGames] = useState<GameOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSyncedName, setHasSyncedName] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadGames = async () => {
      setLoading(true);
      try {
        const userGames = await fetchUserGames(userId);

        if (cancelled) return;

        // Take the 10 most recent games
        const recentGames = userGames.slice(0, 10).map((g) => ({
          id: g.id,
          name: g.name,
          imageUrl: g.imageUrl,
          concept: g.concept,
        }));
        setGames(recentGames);
      } catch (error) {
        if (cancelled) return;
        console.error("Error loading games:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGames();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Sync game name when games are loaded and selectedGameId is set from URL params
  useEffect(() => {
    if (!loading && games.length > 0 && selectedGameId && !hasSyncedName && onGameNameSync) {
      const matchingGame = games.find((g) => g.id === selectedGameId);
      if (matchingGame) {
        onGameNameSync(matchingGame.name);
        setHasSyncedName(true);
      }
    }
  }, [loading, games, selectedGameId, hasSyncedName, onGameNameSync]);

  // Reset sync flag when game changes via user selection
  useEffect(() => {
    if (!selectedGameId) {
      setHasSyncedName(false);
    }
  }, [selectedGameId]);

  const handleSelectGame = (game: GameOption | null) => {
    if (game) {
      onGameChange(game.id, game.name);
    } else {
      onGameChange(null, null);
    }
  };

  const currentGame = games.find((g) => g.id === selectedGameId);

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-w-0 justify-between"
        >
          <div className="flex items-center gap-2">
            {currentGame?.imageUrl ? (
              <div className="relative w-5 h-5 rounded overflow-hidden">
                <Image
                  src={currentGame.imageUrl}
                  alt={currentGame.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <Gamepad2 className="h-4 w-4" />
            )}
            <span className="truncate max-w-30">
              {currentGame?.name || "Select Game"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Select Game</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {games.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No games found. Create a game first.
          </div>
        ) : (
          <>
            {games.map((game) => (
              <DropdownMenuItem
                key={game.id}
                onClick={() => handleSelectGame(game)}
                className={cn("flex items-center gap-3 cursor-pointer py-2")}
              >
                <div className="relative w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                  {game.imageUrl ? (
                    <Image
                      src={game.imageUrl}
                      alt={game.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">
                    {game.name}
                  </span>
                  {game.concept && (
                    <span className="text-xs text-muted-foreground block truncate">
                      {game.concept}
                    </span>
                  )}
                </div>
                {selectedGameId === game.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-muted-foreground cursor-pointer"
              disabled
            >
              <ExternalLink className="h-4 w-4" />
              View All Games
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
