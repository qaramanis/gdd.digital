"use server";

import { getUserGames, getGameForUser, getGame, updateGame as updateGameData, createGame as createGameData, GameData } from "@/lib/data/games";
import { getSharedGames, hasGameAccess } from "@/lib/data/collaboration";
import { uploadFile, deleteFile, BUCKETS } from "@/lib/storage/storage-client";
import { db, schema } from "@/database/drizzle";
import { eq } from "drizzle-orm";

// Helper to safely serialize dates that might be Date objects or strings
function toISOStringOrEmpty(value: Date | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toISOString();
}

export async function fetchGameName(gameId: string) {
  try {
    const game = await getGame(gameId);
    return game?.name || null;
  } catch (error) {
    console.error("Error fetching game name:", error);
    return null;
  }
}

export async function fetchUserGames(userId: string) {
  try {
    // Fetch owned games
    const ownedGames = await getUserGames(userId);
    const transformedOwned = ownedGames.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || "",
      genre: g.genre || null,
      imageUrl: g.imageUrl || null,
      createdAt: toISOStringOrEmpty(g.createdAt),
      updatedAt: toISOStringOrEmpty(g.updatedAt),
      sections: g.sections || [],
      startDate: g.startDate || null,
      timeline: g.timeline || null,
      isOwner: true,
      role: "owner" as const,
    }));

    // Fetch shared games
    const sharedGames = await getSharedGames(userId);
    const transformedShared = sharedGames.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || "",
      genre: g.genre || null,
      imageUrl: g.imageUrl || null,
      createdAt: toISOStringOrEmpty(g.createdAt),
      updatedAt: toISOStringOrEmpty(g.updatedAt),
      sections: g.sections || [],
      startDate: g.startDate || null,
      timeline: g.timeline || null,
      isOwner: false,
      role: g.role,
      ownerName: g.user?.name || "Unknown",
    }));

    // Combine and sort by updatedAt
    return [...transformedOwned, ...transformedShared].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching user games:", error);
    return [];
  }
}

export async function fetchGamePageData(gameId: string, userId: string) {
  try {
    // Check if user has access (owner or member)
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { game: null, error: "Game not found or you don't have access to it" };
    }

    // Fetch the game data
    const game = await getGame(gameId);
    if (!game) {
      return { game: null, error: "Game not found" };
    }

    return {
      game: {
        id: game.id,
        name: game.name,
        concept: game.concept || "",
        genre: game.genre || "",
        image_url: game.imageUrl || "",
        sections: game.sections || [],
        start_date: game.startDate || "",
        timeline: game.timeline || "",
        completed_at: toISOStringOrEmpty(game.completedAt),
        created_at: toISOStringOrEmpty(game.createdAt),
        updated_at: toISOStringOrEmpty(game.updatedAt),
        user_id: game.userId,
        isOwner: access.role === "owner",
        userRole: access.role,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching game page data:", error);
    return { game: null, error: "Failed to load game data" };
  }
}

export async function createGame(data: GameData, userId: string) {
  try {
    const game = await createGameData(data, userId);
    return { success: true, game };
  } catch (error) {
    console.error("Error creating game:", error);
    return { success: false, error: "Failed to create game" };
  }
}

export async function updateGameWithImage(
  gameId: string,
  userId: string,
  data: {
    name: string;
    concept?: string;
    genre?: string;
    currentImageUrl?: string;
    status?: string;
    timeline?: string;
    startDate?: string;
  },
  imageData?: {
    base64: string;
    fileName: string;
    contentType: string;
  }
) {
  try {
    let finalImageUrl = data.currentImageUrl;

    // Handle image upload if provided
    if (imageData) {
      const filePath = `${userId}/${gameId}-${Date.now()}-${imageData.fileName}`;

      // Delete old image if it exists in Supabase storage
      // Supabase URL format: https://[ref].supabase.co/storage/v1/object/public/[bucket]/[path]
      if (data.currentImageUrl && data.currentImageUrl.includes("supabase.co/storage")) {
        try {
          const url = new URL(data.currentImageUrl);
          const pathParts = url.pathname.split("/");
          // Path: /storage/v1/object/public/[bucket]/[...path]
          const bucketIndex = pathParts.indexOf("public") + 1;
          if (bucketIndex > 0 && bucketIndex < pathParts.length) {
            const bucket = pathParts[bucketIndex];
            const key = pathParts.slice(bucketIndex + 1).join("/");
            if (bucket && key) {
              await deleteFile(bucket, key);
            }
          }
        } catch (e) {
          console.error("Failed to delete old image:", e);
        }
      }

      // Upload new image - decode base64 to buffer
      const buffer = Buffer.from(imageData.base64, "base64");
      finalImageUrl = await uploadFile(
        BUCKETS.GAME_IMAGES,
        filePath,
        buffer,
        imageData.contentType,
        { cacheControl: "3600", upsert: true }
      );
    }

    // Determine completedAt based on status
    let completedAt: Date | null | undefined;
    if (data.status === "completed") {
      completedAt = new Date();
    } else if (data.status) {
      completedAt = null;
    }

    // Update game in database
    const savedGame = await updateGameData(gameId, userId, {
      name: data.name.trim(),
      concept: data.concept?.trim() || "",
      genre: data.genre || undefined,
      imageUrl: finalImageUrl,
      timeline: data.timeline?.trim() || undefined,
      startDate: data.startDate || undefined,
      ...(completedAt !== undefined && { completedAt }),
    });

    if (!savedGame) {
      return { success: false, error: "Failed to update game" };
    }

    return {
      success: true,
      game: {
        ...savedGame,
        imageUrl: savedGame.imageUrl,
        genre: savedGame.genre || "",
        createdAt: toISOStringOrEmpty(savedGame.createdAt),
        updatedAt: toISOStringOrEmpty(savedGame.updatedAt),
        completedAt: toISOStringOrEmpty(savedGame.completedAt),
        startDate: savedGame.startDate || "",
        timeline: savedGame.timeline || "",
      },
    };
  } catch (error) {
    console.error("Error updating game with image:", error);
    return { success: false, error: "Failed to update game" };
  }
}

export async function updateGameCompletionStatus(
  gameId: string,
  userId: string,
  isCompleted: boolean
) {
  try {
    const completedAt = isCompleted ? new Date() : null;
    await updateGameData(gameId, userId, { completedAt });
    return { success: true, completedAt: toISOStringOrEmpty(completedAt) };
  } catch (error) {
    console.error("Error updating game completion status:", error);
    return { success: false, error: "Failed to update completion status" };
  }
}

export async function saveGameMechanics(
  gameId: string,
  userId: string,
  mechanics: string[]
) {
  try {
    // Check if user has access to the game
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    // Only owners, admins, and editors can modify mechanics
    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to modify mechanics" };
    }

    // Delete existing mechanics for this game
    await db
      .delete(schema.gameMechanics)
      .where(eq(schema.gameMechanics.gameId, gameId));

    // Insert new mechanics
    if (mechanics.length > 0) {
      await db.insert(schema.gameMechanics).values(
        mechanics.map((name) => ({
          gameId,
          name,
        }))
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving game mechanics:", error);
    return { success: false, error: "Failed to save mechanics" };
  }
}

export async function getGameMechanics(gameId: string, userId: string) {
  try {
    // Check if user has access to the game
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, mechanics: [], error: "You don't have access to this game" };
    }

    // Fetch mechanics for the game
    const mechanics = await db.query.gameMechanics.findMany({
      where: eq(schema.gameMechanics.gameId, gameId),
    });

    return {
      success: true,
      mechanics: mechanics.map((m) => m.name),
    };
  } catch (error) {
    console.error("Error fetching game mechanics:", error);
    return { success: false, mechanics: [], error: "Failed to fetch mechanics" };
  }
}
