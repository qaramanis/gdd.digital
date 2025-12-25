"use client";

import { Calendar, Gamepad2, Monitor } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date-utils";
import Image from "next/image";
import Link from "next/link";

interface ViewAllGameCardProps {
  game: {
    id: string;
    name: string;
    concept?: string | null;
    startDate?: string | null;
    platforms?: string[];
    imageUrl?: string | null;
  };
}

export function ViewAllGameCard({ game }: ViewAllGameCardProps) {
  const hasPlatforms = game.platforms && game.platforms.length > 0;

  return (
    <Link href={`/games/${game.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-1">{game.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Game Preview */}
          <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
            {game.imageUrl ? (
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                src={game.imageUrl}
                alt={game.name}
                className="object-cover"
                unoptimized
              />
            ) : (
              <Gamepad2 className="h-12 w-12 text-accent" />
            )}
          </div>

          {/* Concept */}
          {game.concept && (
            <p className="text-sm text-accent line-clamp-2">{game.concept}</p>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            {/* Release Date (using startDate) */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <span className="text-accent">Release:</span>
              <span>
                {game.startDate ? formatDate(game.startDate) : "Not set"}
              </span>
            </div>

            {/* Platforms */}
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-accent" />
              <span className="text-accent">Platforms:</span>
              {hasPlatforms ? (
                <div className="flex flex-wrap gap-1">
                  {game.platforms!.slice(0, 3).map((platform: string) => (
                    <Badge
                      key={platform}
                      variant="secondary"
                      className="text-xs"
                    >
                      {platform}
                    </Badge>
                  ))}
                  {game.platforms!.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{game.platforms!.length - 3}
                    </Badge>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
