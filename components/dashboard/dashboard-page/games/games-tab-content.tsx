import { Gamepad2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Game } from "../dashboard-page";
import EmptyState from "../empty-state";
import ProjectListItem from "../projects/project-list-item";

export default function GamesTabContent({ games }: { games: Game[] }) {
  const router = useRouter();

  if (games.length === 0) {
    return <EmptyState message="No games yet. Create your first game!" />;
  }

  return (
    <div className="space-y-4">
      {games.slice(0, 5).map((game) => (
        <ProjectListItem
          key={game.id}
          icon={Gamepad2}
          title={game.name}
          subtitle={
            game.concept
              ? `${game.concept.substring(0, 50)}${game.concept.length > 50 ? "..." : ""}`
              : ""
          }
          badge={game.platforms?.[0]}
          imageUrl={game.image_url}
          onClick={() => router.push(`/games/${game.id}`)}
        />
      ))}
    </div>
  );
}
