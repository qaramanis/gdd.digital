"use server";

import { getUserGamesWithDocuments } from "@/lib/data/games";
import { getUserNotes } from "@/lib/data/notes";

export async function fetchGamesPageData(userId: string) {
  try {
    // Fetch games with documents
    const gamesData = await getUserGamesWithDocuments(userId);

    // Fetch notes count
    const notesData = await getUserNotes(userId);

    // Calculate total documents
    const totalDocs = gamesData.reduce(
      (acc, game) => acc + (game.documents?.length || 0),
      0
    );

    // Calculate recent games (updated in last 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    const recentGames = gamesData.filter(
      (game) => game.updatedAt && new Date(game.updatedAt) > recentDate
    ).length;

    const games = gamesData.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || null,
      updatedAt: g.updatedAt?.toISOString() || null,
      imageUrl: g.imageUrl || null,
      documents: g.documents || [],
    }));

    return {
      games,
      stats: {
        totalGames: gamesData.length,
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
