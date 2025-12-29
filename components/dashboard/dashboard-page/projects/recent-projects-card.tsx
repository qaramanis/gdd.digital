import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DashboardData } from "../dashboard-page";
import GamesTabContent from "../games/games-tab-content";

export default function RecentProjectsCard({ data }: { data: DashboardData }) {
  const { games } = data;

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>Your most recently viewed projects</CardDescription>
      </CardHeader>
      <CardContent>
        <GamesTabContent games={games} />
      </CardContent>
    </Card>
  );
}
