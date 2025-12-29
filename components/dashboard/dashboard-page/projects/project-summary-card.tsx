import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DashboardData } from "../dashboard-page";

export default function ProjectSummaryCard({ data }: { data: DashboardData }) {
  const { stats, teams } = data;

  const summaryItems = [
    { label: "Games", value: stats.totalGames },
    { label: "Notes", value: stats.totalNotes },
    {
      label: "Collaborators",
      value: teams.reduce((acc, team) => acc + (team.member_count || 0), 0),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Summary</CardTitle>
        <CardDescription>
          Overview of all your game development work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
          {summaryItems.map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-accent">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
