import StatCard from "./stat-card";
import { formatDistanceToNow } from "date-fns";
import { DashboardData } from "../dashboard-page";

export default function StatsGrid({ data }: { data: DashboardData }) {
  const { games, stats } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Games"
        value={stats.totalGames}
        description={
          games.length > 0 && games[0].created_at
            ? `Latest: ${formatDistanceToNow(new Date(games[0].created_at), { addSuffix: true })}`
            : "No games yet"
        }
      />
      <StatCard
        title="Notes"
        value={stats.totalNotes}
        description="Personal notes & ideas"
      />
      <StatCard
        title="Recent Activity"
        value={stats.recentActivities}
        description="Actions logged"
      />
    </div>
  );
}
