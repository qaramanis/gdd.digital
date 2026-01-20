"use server";

import { getUserGamesWithDocuments } from "@/lib/data/games";
import { getUserNotes } from "@/lib/data/notes";
import { getSharedGames } from "@/lib/data/collaboration";

export async function fetchGamesPageData(userId: string) {
  try {
    // Fetch owned games with documents
    const ownedGamesData = await getUserGamesWithDocuments(userId);

    // Fetch shared games (games user is a member of)
    const sharedGamesData = await getSharedGames(userId);

    // Fetch notes count
    const notesData = await getUserNotes(userId);

    // Transform owned games
    const ownedGames = ownedGamesData.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || null,
      genre: g.genre || null,
      updatedAt: g.updatedAt?.toISOString() || null,
      imageUrl: g.imageUrl || null,
      documents: g.documents || [],
      isOwner: true,
      role: "owner" as const,
    }));

    // Transform shared games
    const sharedGames = sharedGamesData.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || null,
      genre: g.genre || null,
      updatedAt: g.updatedAt?.toISOString() || null,
      imageUrl: g.imageUrl || null,
      documents: [], // Shared games don't have documents preloaded
      isOwner: false,
      role: g.role,
      ownerName: g.user?.name || "Unknown",
    }));

    // Combine and sort by updatedAt
    const allGames = [...ownedGames, ...sharedGames].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    // Calculate total documents (only from owned games)
    const totalDocs = ownedGamesData.reduce(
      (acc, game) => acc + (game.documents?.length || 0),
      0
    );

    // Calculate recent games (updated in last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentGames = allGames.filter(
      (game) => game.updatedAt && new Date(game.updatedAt) > recentDate
    ).length;

    return {
      games: allGames,
      stats: {
        totalGames: allGames.length,
        totalDocuments: totalDocs,
        totalNotes: notesData?.length || 0,
        recentGames: recentGames,
      },
    };
  } catch (error) {
    console.error("Error fetching games page data:", error);
    return {
      games: [],
      stats: {
        totalGames: 0,
        totalDocuments: 0,
        totalNotes: 0,
        recentGames: 0,
      },
    };
  }
}
