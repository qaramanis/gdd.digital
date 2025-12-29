import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DashboardData } from "../dashboard-page";
import { Gamepad2 } from "lucide-react";

export default function GddOverviewCard({ data }: { data: DashboardData }) {
  const { stats } = data;

  const totalGames = stats.totalGames;

  return (
    <Card className="col-span-3 flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Active Projects
        </CardTitle>
        <CardDescription>Your game projects</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-bold">{totalGames}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {totalGames === 1 ? "Project" : "Projects"} in development
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
