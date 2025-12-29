"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-context";
import { fetchDashboardData as fetchData } from "@/lib/actions/dashboard-actions";
import DashboardSkeleton from "./dashboard-skeleton";
import ActivitySummaryCard from "./activity/activity-summary-card";
import DashboardHeader from "./dashboard-header";
import StatsGrid from "./stats/stats-grid";
import TeamsCard from "./teams/teams-card";
import RecentProjectsCard from "./projects/recent-projects-card";
import GddOverviewCard from "./projects/gdd-overview-card";
import QuickActionsCard from "./quick-actions/quick-actions-card";

export interface Game {
  id: number;
  name: string;
  concept: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  release_date?: string;
  team_id?: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  member_count?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata?: any;
}

export interface Stats {
  totalGames: number;
  totalTeams: number;
  totalNotes: number;
  recentActivities: number;
}

export interface DashboardData {
  games: Game[];
  teams: Team[];
  notes: Note[];
  activities: ActivityLog[];
  stats: Stats;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    games: [],
    teams: [],
    notes: [],
    activities: [],
    stats: {
      totalGames: 0,
      totalTeams: 0,
      totalNotes: 0,
      recentActivities: 0,
    },
  });

  // Redirect to sign-in if no user after loading completes
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchData(userId!);
      setDashboardData(data as DashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || userLoading || !userId) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DashboardHeader />
      <StatsGrid data={dashboardData} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentProjectsCard data={dashboardData} />
        <GddOverviewCard data={dashboardData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ActivitySummaryCard data={dashboardData} />
        <TeamsCard teams={dashboardData.teams} />
        <QuickActionsCard />
      </div>
    </div>
  );
}
