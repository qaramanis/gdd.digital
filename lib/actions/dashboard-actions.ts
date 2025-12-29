"use server";

import { getUserGames } from "@/lib/data/games";
import { getUserNotes } from "@/lib/data/notes";
import { getTeamsByUser, getUserActivityLog } from "@/lib/data/collaboration";

export interface DashboardData {
  games: any[];
  teams: any[];
  notes: any[];
  activities: any[];
  stats: {
    totalGames: number;
    totalTeams: number;
    totalNotes: number;
    recentActivities: number;
  };
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  try {
    // Fetch games
    const gamesData = await getUserGames(userId);

    // Fetch teams
    const teamsData = await getTeamsByUser(userId);

    // Fetch notes
    const notesData = await getUserNotes(userId, 5);

    // Fetch activity logs
    const activitiesData = await getUserActivityLog(userId, 10);

    // Transform data to match expected interface
    const transformedGames = gamesData.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || "",
      image_url: g.imageUrl || undefined,
      created_at: g.createdAt?.toISOString() || "",
      updated_at: g.updatedAt?.toISOString() || "",
    }));

    const transformedTeams = teamsData.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || undefined,
      created_at: t.createdAt?.toISOString() || "",
    }));

    const transformedNotes = notesData.map((n) => ({
      id: n.id,
      title: n.title || "Untitled",
      content: n.content || "",
      created_at: n.createdAt?.toISOString() || "",
      updated_at: n.updatedAt?.toISOString() || "",
    }));

    const transformedActivities = activitiesData.map((a) => ({
      id: a.id,
      user_id: a.userId,
      action: a.action,
      entity_type: a.gameId ? "game" : a.teamId ? "team" : "unknown",
      entity_id: a.gameId || a.teamId || "",
      created_at: a.createdAt?.toISOString() || "",
      metadata: a.details,
    }));

    return {
      games: transformedGames,
      teams: transformedTeams,
      notes: transformedNotes,
      activities: transformedActivities,
      stats: {
        totalGames: transformedGames.length,
        totalTeams: transformedTeams.length,
        totalNotes: transformedNotes.length,
        recentActivities: transformedActivities.length,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
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
    };
  }
}
