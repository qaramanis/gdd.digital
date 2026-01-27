"use server";

import { db, schema } from "@/database/drizzle";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import { hasGameAccess } from "@/lib/data/collaboration";
import { uploadFile, deleteFile, BUCKETS } from "@/lib/storage/storage-client";

export interface AudioAsset {
  id: string;
  gameId: string;
  createdBy: string;
  name: string | null;
  filename: string;
  description: string | null;
  linkedCharacters: string[];
  linkedScenes: string[];
  linkedMechanics: string[];
  storageType: string | null;
  audioUrl: string | null;
  bucketPath: string | null;
  fileSize: number | null;
  fileFormat: string | null;
  duration: number | null;
  audioData: any;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreateAudioAssetData {
  name?: string;
  filename: string;
  description?: string;
  linkedCharacters?: string[];
  linkedScenes?: string[];
  linkedMechanics?: string[];
}

export async function getAudioAssetsByGame(gameId: string, userId: string) {
  try {
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, audioAssets: [], error: "You don't have access to this game" };
    }

    const audioAssets = await db.query.gameAudioAssets.findMany({
      where: eq(schema.gameAudioAssets.gameId, gameId),
      orderBy: (assets, { desc }) => [desc(assets.createdAt)],
    });

    return {
      success: true,
      audioAssets: audioAssets.map((a) => ({
        ...a,
        linkedCharacters: (a.linkedCharacters as string[]) || [],
        linkedScenes: (a.linkedScenes as string[]) || [],
        linkedMechanics: (a.linkedMechanics as string[]) || [],
      })),
    };
  } catch (error) {
    console.error("Error fetching audio assets:", error);
    return { success: false, audioAssets: [], error: "Failed to fetch audio assets" };
  }
}

export interface PaginatedAudioAssetsParams {
  gameId: string;
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedAudioAssetsResult {
  success: boolean;
  audioAssets: AudioAsset[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  error?: string;
}

export async function getPaginatedAudioAssets({
  gameId,
  userId,
  page = 1,
  limit = 10,
  search = "",
}: PaginatedAudioAssetsParams): Promise<PaginatedAudioAssetsResult> {
  try {
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return {
        success: false,
        audioAssets: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        error: "You don't have access to this game",
      };
    }

    const offset = (page - 1) * limit;

    const conditions = [eq(schema.gameAudioAssets.gameId, gameId)];

    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.gameAudioAssets.name, searchTerm),
          ilike(schema.gameAudioAssets.filename, searchTerm),
          ilike(schema.gameAudioAssets.description, searchTerm)
        )!
      );
    }

    const whereClause = and(...conditions);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.gameAudioAssets)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    const audioAssets = await db
      .select()
      .from(schema.gameAudioAssets)
      .where(whereClause)
      .orderBy(desc(schema.gameAudioAssets.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      audioAssets: audioAssets.map((a) => ({
        ...a,
        linkedCharacters: (a.linkedCharacters as string[]) || [],
        linkedScenes: (a.linkedScenes as string[]) || [],
        linkedMechanics: (a.linkedMechanics as string[]) || [],
      })),
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching paginated audio assets:", error);
    return {
      success: false,
      audioAssets: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      error: "Failed to fetch audio assets",
    };
  }
}

export async function createAudioAsset(
  gameId: string,
  userId: string,
  data: CreateAudioAssetData
) {
  try {
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to create audio assets" };
    }

    const [audioAsset] = await db
      .insert(schema.gameAudioAssets)
      .values({
        gameId,
        createdBy: userId,
        name: data.name || null,
        filename: data.filename,
        description: data.description || null,
        linkedCharacters: data.linkedCharacters || [],
        linkedScenes: data.linkedScenes || [],
        linkedMechanics: data.linkedMechanics || [],
      })
      .returning();

    return {
      success: true,
      audioAsset: {
        ...audioAsset,
        linkedCharacters: (audioAsset.linkedCharacters as string[]) || [],
        linkedScenes: (audioAsset.linkedScenes as string[]) || [],
        linkedMechanics: (audioAsset.linkedMechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error creating audio asset:", error);
    return { success: false, error: "Failed to create audio asset" };
  }
}

export async function updateAudioAsset(
  audioAssetId: string,
  userId: string,
  data: Partial<CreateAudioAssetData>
) {
  try {
    const existingAsset = await db.query.gameAudioAssets.findFirst({
      where: eq(schema.gameAudioAssets.id, audioAssetId),
    });

    if (!existingAsset) {
      return { success: false, error: "Audio asset not found" };
    }

    const access = await hasGameAccess(existingAsset.gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to update audio assets" };
    }

    const [audioAsset] = await db
      .update(schema.gameAudioAssets)
      .set({
        name: data.name !== undefined ? data.name || null : undefined,
        description: data.description !== undefined ? data.description || null : undefined,
        linkedCharacters: data.linkedCharacters,
        linkedScenes: data.linkedScenes,
        linkedMechanics: data.linkedMechanics,
        updatedAt: new Date(),
      })
      .where(eq(schema.gameAudioAssets.id, audioAssetId))
      .returning();

    return {
      success: true,
      audioAsset: {
        ...audioAsset,
        linkedCharacters: (audioAsset.linkedCharacters as string[]) || [],
        linkedScenes: (audioAsset.linkedScenes as string[]) || [],
        linkedMechanics: (audioAsset.linkedMechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error updating audio asset:", error);
    return { success: false, error: "Failed to update audio asset" };
  }
}

export async function deleteAudioAsset(audioAssetId: string, userId: string) {
  try {
    const existingAsset = await db.query.gameAudioAssets.findFirst({
      where: eq(schema.gameAudioAssets.id, audioAssetId),
    });

    if (!existingAsset) {
      return { success: false, error: "Audio asset not found" };
    }

    const access = await hasGameAccess(existingAsset.gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to delete audio assets" };
    }

    if (existingAsset.bucketPath) {
      try {
        await deleteFile(BUCKETS.AUDIO_ASSETS, existingAsset.bucketPath);
      } catch (error) {
        console.error("Error deleting audio file:", error);
      }
    }

    await db
      .delete(schema.gameAudioAssets)
      .where(eq(schema.gameAudioAssets.id, audioAssetId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting audio asset:", error);
    return { success: false, error: "Failed to delete audio asset" };
  }
}

export async function uploadAudioFile(
  audioAssetId: string,
  userId: string,
  fileData: {
    buffer: number[];
    name: string;
    type: string;
    size: number;
  }
) {
  try {
    const existingAsset = await db.query.gameAudioAssets.findFirst({
      where: eq(schema.gameAudioAssets.id, audioAssetId),
    });

    if (!existingAsset) {
      return { success: false, error: "Audio asset not found" };
    }

    const access = await hasGameAccess(existingAsset.gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to upload audio files" };
    }

    if (existingAsset.bucketPath) {
      try {
        await deleteFile(BUCKETS.AUDIO_ASSETS, existingAsset.bucketPath);
      } catch (error) {
        console.error("Error deleting old audio file:", error);
      }
    }

    const fileExt = fileData.name.split(".").pop()?.toLowerCase() || "mp3";
    const bucketPath = `${existingAsset.gameId}/${audioAssetId}/${Date.now()}.${fileExt}`;

    const buffer = Buffer.from(fileData.buffer);
    const audioUrl = await uploadFile(
      BUCKETS.AUDIO_ASSETS,
      bucketPath,
      buffer,
      fileData.type || "audio/mpeg"
    );

    const [audioAsset] = await db
      .update(schema.gameAudioAssets)
      .set({
        storageType: "supabase",
        audioUrl,
        bucketPath,
        fileSize: fileData.size,
        fileFormat: `.${fileExt}`,
        audioData: { originalFileName: fileData.name },
        updatedAt: new Date(),
      })
      .where(eq(schema.gameAudioAssets.id, audioAssetId))
      .returning();

    return {
      success: true,
      audioAsset: {
        ...audioAsset,
        linkedCharacters: (audioAsset.linkedCharacters as string[]) || [],
        linkedScenes: (audioAsset.linkedScenes as string[]) || [],
        linkedMechanics: (audioAsset.linkedMechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error uploading audio file:", error);
    return { success: false, error: "Failed to upload audio file" };
  }
}

export async function createAudioAssetWithFile(
  gameId: string,
  userId: string,
  fileData: {
    buffer: number[];
    name: string;
    type: string;
    size: number;
  },
  metadata: {
    name?: string;
    description?: string;
  }
) {
  try {
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to create audio assets" };
    }

    const fileExt = fileData.name.split(".").pop()?.toLowerCase() || "mp3";

    const [audioAsset] = await db
      .insert(schema.gameAudioAssets)
      .values({
        gameId,
        createdBy: userId,
        name: metadata.name || null,
        filename: fileData.name,
        description: metadata.description || null,
        linkedCharacters: [],
        linkedScenes: [],
        linkedMechanics: [],
        fileFormat: `.${fileExt}`,
        fileSize: fileData.size,
      })
      .returning();

    const bucketPath = `${gameId}/${audioAsset.id}/${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(fileData.buffer);
    const audioUrl = await uploadFile(
      BUCKETS.AUDIO_ASSETS,
      bucketPath,
      buffer,
      fileData.type || "audio/mpeg"
    );

    const [updatedAsset] = await db
      .update(schema.gameAudioAssets)
      .set({
        storageType: "supabase",
        audioUrl,
        bucketPath,
        audioData: { originalFileName: fileData.name },
      })
      .where(eq(schema.gameAudioAssets.id, audioAsset.id))
      .returning();

    return {
      success: true,
      audioAsset: {
        ...updatedAsset,
        linkedCharacters: (updatedAsset.linkedCharacters as string[]) || [],
        linkedScenes: (updatedAsset.linkedScenes as string[]) || [],
        linkedMechanics: (updatedAsset.linkedMechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error creating audio asset with file:", error);
    return { success: false, error: "Failed to create audio asset" };
  }
}

export async function getLinkedEntities(gameId: string, userId: string) {
  try {
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    const characters = await db.query.gameCharacters.findMany({
      where: eq(schema.gameCharacters.gameId, gameId),
      columns: {
        id: true,
        name: true,
      },
      orderBy: (chars, { asc }) => [asc(chars.name)],
    });

    const scenes = await db.query.gameScenes.findMany({
      where: eq(schema.gameScenes.gameId, gameId),
      columns: {
        id: true,
        name: true,
      },
      orderBy: (s, { asc }) => [asc(s.name)],
    });

    // Get selected mechanics for this game
    const mechanics = await db.query.gameMechanics.findMany({
      where: eq(schema.gameMechanics.gameId, gameId),
    });

    // Get custom mechanics for this game (only selected ones)
    const customMechanics = await db.query.customGameMechanics.findMany({
      where: eq(schema.customGameMechanics.gameId, gameId),
    });

    return {
      success: true,
      characters: characters.map(c => ({ id: c.id, name: c.name })),
      scenes: scenes.map(s => ({ id: s.id, name: s.name })),
      mechanics: mechanics.map(m => m.name),
      customMechanics: customMechanics
        .filter(m => m.isSelected === "true")
        .map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
        })),
    };
  } catch (error) {
    console.error("Error fetching linked entities:", error);
    return { success: false, error: "Failed to fetch characters and scenes" };
  }
}
