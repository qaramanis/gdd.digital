"use server";

import { getUserGames, getGameForUser, getGame, updateGame as updateGameData, createGame as createGameData, GameData } from "@/lib/data/games";
import { getDocumentsByGame } from "@/lib/data/documents";
import { uploadFile, deleteFile, BUCKETS } from "@/lib/storage/minio-client";

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
    const games = await getUserGames(userId);
    return games.map((g) => ({
      id: g.id,
      name: g.name,
      concept: g.concept || "",
      imageUrl: g.imageUrl || null,
      createdAt: toISOStringOrEmpty(g.createdAt),
      updatedAt: toISOStringOrEmpty(g.updatedAt),
      platforms: g.platforms || [],
      sections: g.sections || [],
      startDate: g.startDate || null,
      timeline: g.timeline || null,
    }));
  } catch (error) {
    console.error("Error fetching user games:", error);
    return [];
  }
}

export async function fetchGamePageData(gameId: string, userId: string) {
  try {
    const game = await getGameForUser(gameId, userId);
    if (!game) {
      return { game: null, document: null, sections: [], error: "Game not found or you don't have access to it" };
    }

    const docs = await getDocumentsByGame(gameId);
    const document = docs[0] || null;

    let sections: any[] = [];
    if (document && document.sections) {
      sections = document.sections.map((s) => ({
        id: s.id,
        document_id: s.documentId,
        title: s.title,
        content: s.content,
        order: s.orderIndex,
      }));
    }

    return {
      game: {
        id: game.id,
        name: game.name,
        concept: game.concept || "",
        image_url: game.imageUrl || "",
        platforms: game.platforms || [],
        sections: game.sections || [],
        start_date: game.startDate || "",
        timeline: game.timeline || "",
        created_at: toISOStringOrEmpty(game.createdAt),
        updated_at: toISOStringOrEmpty(game.updatedAt),
        user_id: game.userId,
      },
      document: document ? {
        id: document.id,
        game_id: document.gameId,
        title: document.title,
        created_at: toISOStringOrEmpty(document.createdAt),
        updated_at: toISOStringOrEmpty(document.updatedAt),
      } : null,
      sections,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching game page data:", error);
    return { game: null, document: null, sections: [], error: "Failed to load game data" };
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
    currentImageUrl?: string;
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

      // Delete old image if it exists in MinIO storage
      if (data.currentImageUrl && data.currentImageUrl.includes("localhost:9000")) {
        try {
          const urlParts = data.currentImageUrl.split("/");
          const bucket = urlParts[urlParts.length - 2];
          const key = urlParts[urlParts.length - 1];
          if (bucket && key) {
            await deleteFile(bucket, `${userId}/${key}`);
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

    // Update game in database
    const savedGame = await updateGameData(gameId, userId, {
      name: data.name.trim(),
      concept: data.concept?.trim() || "",
      imageUrl: finalImageUrl,
    });

    if (!savedGame) {
      return { success: false, error: "Failed to update game" };
    }

    return {
      success: true,
      game: {
        ...savedGame,
        imageUrl: savedGame.imageUrl,
        createdAt: toISOStringOrEmpty(savedGame.createdAt),
        updatedAt: toISOStringOrEmpty(savedGame.updatedAt),
      },
    };
  } catch (error) {
    console.error("Error updating game with image:", error);
    return { success: false, error: "Failed to update game" };
  }
}
