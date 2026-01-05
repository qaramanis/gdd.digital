"use server";

import { getUserGames } from "@/lib/data/games";
import { getUserNotes } from "@/lib/data/notes";
import { getUserActivityLog, getSharedGames } from "@/lib/data/collaboration";

export interface DashboardData {
  games: any[];
  notes: any[];
  activities: any[];
  stats: {
    totalGames: number;
    totalNotes: number;
    recentActivities: number;
  };
}

export async function fetchDashboardData(userId: string): Promise<DashboardData> {
  try {
    // Fetch owned games
    const ownedGamesData = await getUserGames(userId);

    // Fetch shared games (games user is a member of)
    const sharedGamesData = await getSharedGames(userId);

    // Fetch notes
    const notesData = await getUserNotes(userId, 5);

    // Fetch activity logs
    const activitiesData = await getUserActivityLog(userId, 10);

    // Transform owned games
    const transformedOwnedGames = ownedGamesData.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || "",
      image_url: g.imageUrl || undefined,
      created_at: g.createdAt?.toISOString() || "",
      updated_at: g.updatedAt?.toISOString() || "",
      isOwner: true,
      role: "owner" as const,
    }));

    // Transform shared games
    const transformedSharedGames = sharedGamesData.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || "",
      image_url: g.imageUrl || undefined,
      created_at: g.createdAt?.toISOString() || "",
      updated_at: g.updatedAt?.toISOString() || "",
      isOwner: false,
      role: g.role,
      ownerName: g.user?.name || "Unknown",
    }));

    // Combine and sort by updated_at
    const allGames = [...transformedOwnedGames, ...transformedSharedGames].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

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
      entity_type: a.gameId ? "game" : "unknown",
      entity_id: a.gameId || "",
      created_at: a.createdAt?.toISOString() || "",
      metadata: a.details,
    }));

    return {
      games: allGames,
      notes: transformedNotes,
      activities: transformedActivities,
      stats: {
        totalGames: allGames.length,
        totalNotes: transformedNotes.length,
        recentActivities: transformedActivities.length,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      games: [],
      notes: [],
      activities: [],
      stats: {
        totalGames: 0,
        totalNotes: 0,
        recentActivities: 0,
      },
    };
  }
}
