import {
  Clock,
  Calendar,
  FileText,
  Gamepad2,
  MoreVertical,
  Eye,
  Edit,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date-utils";
import Image from "next/image";

interface GameCardProps {
  game: any;
  viewMode: string;
  getTimeAgo: (date: string) => string;
  onView: () => void;
  onEdit: () => void;
}

export function GameCard({
  game,
  viewMode,
  getTimeAgo,
  onView,
  onEdit,
}: GameCardProps) {
  const hasDocument = game.documents && game.documents.length > 0;

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden relative">
                {game.image_url ? (
                  <Image
                    fill
                    sizes="64px"
                    src={game.image_url}
                    alt={game.name}
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Gamepad2 className="h-8 w-8 text-accent" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{game.name}</h3>
                  {game.genre && (
                    <Badge variant="secondary" className="capitalize">
                      {game.genre.replace("-", "/")}
                    </Badge>
                  )}
                  {hasDocument && (
                    <Badge variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      Doc
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-accent line-clamp-1 mt-1">
                  {game.concept || "No concept description"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-accent">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(game.updated_at)}
                  </span>
                  {game.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Started {formatDate(game.start_date)}
                    </span>
                  )}
                  {game.timeline && <span>{game.timeline}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onView}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onView}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg line-clamp-1">{game.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => e.stopPropagation()}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Game Preview */}
          <div className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden relative">
            {game.image_url ? (
              <Image
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                src={game.image_url}
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
            <div className="flex items-center justify-between">
              <span className="text-accent flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last updated
              </span>
              <span>{getTimeAgo(game.updated_at)}</span>
            </div>
            {game.genre && (
              <div className="flex items-center justify-between">
                <span className="text-accent">Genre</span>
                <span className="capitalize">{game.genre.replace("-", "/")}</span>
              </div>
            )}
            {game.start_date && (
              <div className="flex items-center justify-between">
                <span className="text-accent flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started
                </span>
                <span>{formatDate(game.start_date)}</span>
              </div>
            )}
            {game.timeline && (
              <div className="flex items-center justify-between">
                <span className="text-accent">Timeline</span>
                <span>{game.timeline}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
