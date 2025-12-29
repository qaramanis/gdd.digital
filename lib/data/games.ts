import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, desc, and } from "drizzle-orm";

export interface GameData {
  name: string;
  concept?: string;
  startDate?: string;
  timeline?: string;
  sections?: string[];
  imageUrl?: string;
  completedAt?: Date | null;
}

/**
 * Get all games for a user
 */
export async function getUserGames(userId: string) {
  return db.query.games.findMany({
    where: eq(schema.games.userId, userId),
    orderBy: [desc(schema.games.updatedAt)],
    with: {
      user: true,
    },
  });
}

/**
 * Get games with document count
 */
export async function getUserGamesWithDocuments(userId: string) {
  const games = await db.query.games.findMany({
    where: eq(schema.games.userId, userId),
    orderBy: [desc(schema.games.updatedAt)],
  });

  // Get document counts for each game
  const gamesWithDocs = await Promise.all(
    games.map(async (game) => {
      const docs = await db.query.documents.findMany({
        where: eq(schema.documents.gameId, game.id),
        columns: { id: true, title: true },
      });
      return { ...game, documents: docs };
    })
  );

  return gamesWithDocs;
}

/**
 * Get a specific game by ID
 */
export async function getGame(gameId: string) {
  return db.query.games.findFirst({
    where: eq(schema.games.id, gameId),
    with: {
      user: true,
    },
  });
}

/**
 * Get a game with permission check
 */
export async function getGameForUser(gameId: string, userId: string) {
  return db.query.games.findFirst({
    where: and(eq(schema.games.id, gameId), eq(schema.games.userId, userId)),
    with: {
      user: true,
    },
  });
}

/**
 * Create a new game
 */
export async function createGame(gameData: GameData, userId: string) {
  const [game] = await db
    .insert(schema.games)
    .values({
      ...gameData,
      userId,
    })
    .returning();
  return game;
}

/**
 * Update a game
 */
export async function updateGame(
  gameId: string,
  userId: string,
  data: Partial<GameData>
) {
  const [updated] = await db
    .update(schema.games)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(schema.games.id, gameId), eq(schema.games.userId, userId)))
    .returning();
  return updated;
}

/**
 * Delete a game
 */
export async function deleteGame(gameId: string, userId: string) {
  const [deleted] = await db
    .delete(schema.games)
    .where(and(eq(schema.games.id, gameId), eq(schema.games.userId, userId)))
    .returning();
  return deleted;
}

