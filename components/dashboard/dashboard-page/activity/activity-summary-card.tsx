import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Gamepad2, FileText, Users, StickyNote } from "lucide-react";
import { DashboardData } from "../dashboard-page";

interface ActivityStat {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
}

export default function ActivitySummaryCard({
  data,
}: {
  data: DashboardData;
}) {
  const { activities } = data;

  // Count activities by entity type
  const activityCounts = activities.reduce(
    (acc, activity) => {
      const type = activity.entity_type || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count activities from the last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = activities.filter(
    (a) => new Date(a.created_at) >= weekAgo
  ).length;

  const stats: ActivityStat[] = [
    {
      label: "Games",
      count: activityCounts.game || 0,
      icon: Gamepad2,
      color: "text-blue-500",
    },
    {
      label: "Documents",
      count: activityCounts.document || 0,
      icon: FileText,
      color: "text-green-500",
    },
    {
      label: "Teams",
      count: activityCounts.team || 0,
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Notes",
      count: activityCounts.note || 0,
      icon: StickyNote,
      color: "text-yellow-500",
    },
  ];

  const totalActivities = activities.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Summary</CardTitle>
        <CardDescription>Your activity breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {totalActivities > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <span className="text-2xl font-bold">{thisWeekCount}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {stats.map(({ label, count, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-accent truncate">{label}</p>
                    <p className="text-sm font-semibold">{count}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-accent">Total Activities</span>
                <span className="font-medium">{totalActivities}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Activity className="h-8 w-8 mx-auto text-accent mb-2" />
            <p className="text-sm text-accent">No activity yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
