"use server";

import { db, schema } from "@/database/drizzle";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import { hasGameAccess } from "@/lib/data/collaboration";
import { uploadFile, deleteFile, BUCKETS } from "@/lib/storage/storage-client";

export interface Character {
  id: string;
  gameId: string;
  createdBy: string;
  name: string;
  description: string | null;
  mechanics: string[];
  storageType: string | null;
  modelUrl: string | null;
  bucketPath: string | null;
  thumbnailUrl: string | null;
  fileSize: number | null;
  fileFormat: string | null;
  modelData: any;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CreateCharacterData {
  name: string;
  description?: string;
  mechanics?: string[];
}

export async function getCharactersByGame(gameId: string, userId: string) {
  try {
    // Check if user has access to the game
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, characters: [], error: "You don't have access to this game" };
    }

    const characters = await db.query.gameCharacters.findMany({
      where: eq(schema.gameCharacters.gameId, gameId),
      orderBy: (characters, { desc }) => [desc(characters.createdAt)],
    });

    return {
      success: true,
      characters: characters.map((c) => ({
        ...c,
        mechanics: (c.mechanics as string[]) || [],
      })),
    };
  } catch (error) {
    console.error("Error fetching characters:", error);
    return { success: false, characters: [], error: "Failed to fetch characters" };
  }
}

export interface PaginatedCharactersParams {
  gameId: string;
  userId: string;
  page?: number;
  limit?: number;
  search?: string;
  hasModel?: boolean | null;
}

export interface PaginatedCharactersResult {
  success: boolean;
  characters: Character[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  error?: string;
}

export async function getPaginatedCharacters({
  gameId,
  userId,
  page = 1,
  limit = 10,
  search = "",
  hasModel = null,
}: PaginatedCharactersParams): Promise<PaginatedCharactersResult> {
  try {
    // Check if user has access to the game
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return {
        success: false,
        characters: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        error: "You don't have access to this game",
      };
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(schema.gameCharacters.gameId, gameId)];

    // Add search filter (searches name and description)
    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.gameCharacters.name, searchTerm),
          ilike(schema.gameCharacters.description, searchTerm)
        )!
      );
    }

    // Add model filter
    if (hasModel === true) {
      conditions.push(sql`${schema.gameCharacters.modelUrl} IS NOT NULL`);
    } else if (hasModel === false) {
      conditions.push(sql`${schema.gameCharacters.modelUrl} IS NULL`);
    }

    const whereClause = and(...conditions);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.gameCharacters)
      .where(whereClause);

    const totalCount = Number(countResult[0]?.count || 0);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated characters
    const characters = await db
      .select()
      .from(schema.gameCharacters)
      .where(whereClause)
      .orderBy(desc(schema.gameCharacters.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      success: true,
      characters: characters.map((c) => ({
        ...c,
        mechanics: (c.mechanics as string[]) || [],
      })),
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching paginated characters:", error);
    return {
      success: false,
      characters: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      error: "Failed to fetch characters",
    };
  }
}

export async function createCharacter(
  gameId: string,
  userId: string,
  data: CreateCharacterData
) {
  try {
    // Check if user has access to the game
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    // Only owners, admins, and editors can create characters
    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to create characters" };
    }

    const [character] = await db
      .insert(schema.gameCharacters)
      .values({
        gameId,
        createdBy: userId,
        name: data.name,
        description: data.description || null,
        mechanics: data.mechanics || [],
      })
      .returning();

    return {
      success: true,
      character: {
        ...character,
        mechanics: (character.mechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error creating character:", error);
    return { success: false, error: "Failed to create character" };
  }
}

export async function updateCharacter(
  characterId: string,
  userId: string,
  data: Partial<CreateCharacterData>
) {
  try {
    // Get the character to find the gameId
    const existingCharacter = await db.query.gameCharacters.findFirst({
      where: eq(schema.gameCharacters.id, characterId),
    });

    if (!existingCharacter) {
      return { success: false, error: "Character not found" };
    }

    // Check if user has access to the game
    const access = await hasGameAccess(existingCharacter.gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    // Only owners, admins, and editors can update characters
    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to update characters" };
    }

    const [character] = await db
      .update(schema.gameCharacters)
      .set({
        name: data.name,
        description: data.description,
        mechanics: data.mechanics,
        updatedAt: new Date(),
      })
      .where(eq(schema.gameCharacters.id, characterId))
      .returning();

    return {
      success: true,
      character: {
        ...character,
        mechanics: (character.mechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error updating character:", error);
    return { success: false, error: "Failed to update character" };
  }
}

export async function deleteCharacter(characterId: string, userId: string) {
  try {
    // Get the character to find the gameId
    const existingCharacter = await db.query.gameCharacters.findFirst({
      where: eq(schema.gameCharacters.id, characterId),
    });

    if (!existingCharacter) {
      return { success: false, error: "Character not found" };
    }

    // Check if user has access to the game
    const access = await hasGameAccess(existingCharacter.gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    // Only owners, admins, and editors can delete characters
    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to delete characters" };
    }

    // Delete model file from storage if exists
    if (existingCharacter.bucketPath) {
      try {
        await deleteFile(BUCKETS.CHARACTER_MODELS, existingCharacter.bucketPath);
      } catch (error) {
        console.error("Error deleting model file:", error);
      }
    }

    await db
      .delete(schema.gameCharacters)
      .where(eq(schema.gameCharacters.id, characterId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting character:", error);
    return { success: false, error: "Failed to delete character" };
  }
}

export async function uploadCharacterModel(
  characterId: string,
  userId: string,
  fileData: {
    buffer: number[];
    name: string;
    type: string;
    size: number;
  }
) {
  try {
    // Get the character to find the gameId
    const existingCharacter = await db.query.gameCharacters.findFirst({
      where: eq(schema.gameCharacters.id, characterId),
    });

    if (!existingCharacter) {
      return { success: false, error: "Character not found" };
    }

    // Check if user has access to the game
    const access = await hasGameAccess(existingCharacter.gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    // Only owners, admins, and editors can upload models
    if (!access.role || !["owner", "admin", "editor"].includes(access.role)) {
      return { success: false, error: "You don't have permission to upload models" };
    }

    // Delete old model file if exists
    if (existingCharacter.bucketPath) {
      try {
        await deleteFile(BUCKETS.CHARACTER_MODELS, existingCharacter.bucketPath);
      } catch (error) {
        console.error("Error deleting old model file:", error);
      }
    }

    // Generate unique path for the model
    const fileExt = fileData.name.split(".").pop()?.toLowerCase() || "glb";
    const bucketPath = `${existingCharacter.gameId}/${characterId}/${Date.now()}.${fileExt}`;

    // Convert buffer back to Buffer for upload
    const buffer = Buffer.from(fileData.buffer);
    const modelUrl = await uploadFile(
      BUCKETS.CHARACTER_MODELS,
      bucketPath,
      buffer,
      fileData.type || "application/octet-stream"
    );

    // Update character with model details
    const [character] = await db
      .update(schema.gameCharacters)
      .set({
        storageType: "supabase",
        modelUrl,
        bucketPath,
        fileSize: fileData.size,
        fileFormat: `.${fileExt}`,
        modelData: { originalFileName: fileData.name },
        updatedAt: new Date(),
      })
      .where(eq(schema.gameCharacters.id, characterId))
      .returning();

    return {
      success: true,
      character: {
        ...character,
        mechanics: (character.mechanics as string[]) || [],
      },
    };
  } catch (error) {
    console.error("Error uploading character model:", error);
    return { success: false, error: "Failed to upload model" };
  }
}
