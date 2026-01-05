import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, desc } from "drizzle-orm";
import {
  uploadFile,
  deleteFile,
  BUCKETS,
  getBucketForFile,
} from "@/lib/storage/storage-client";

export interface SceneMetadata {
  name: string;
  description?: string;
  engine: "unity" | "unreal" | "godot" | "custom";
  engineVersion?: string;
  tags?: string[];
}

export interface SceneUploadResult {
  scene: typeof schema.gameScenes.$inferSelect;
  publicUrl: string;
}

/**
 * Upload a scene file
 */
export async function uploadScene(
  gameId: string,
  file: File,
  metadata: SceneMetadata,
  userId: string
): Promise<SceneUploadResult> {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  const isWebGL = ["html", "data", "wasm", "js"].includes(fileExt);
  const bucket = isWebGL ? BUCKETS.SCENES_WEBGL : BUCKETS.SCENE_FILES;

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `${gameId}/${timestamp}_${safeName}`;

  // Upload to MinIO
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicUrl = await uploadFile(bucket, path, buffer, file.type);

  // Save to database
  const [scene] = await db
    .insert(schema.gameScenes)
    .values({
      gameId,
      name: metadata.name,
      description: metadata.description,
      engine: metadata.engine,
      engineVersion: metadata.engineVersion,
      storageType: "supabase",
      bucketPath: path,
      sceneUrl: publicUrl,
      fileSize: file.size,
      fileFormat: `.${fileExt}`,
      isPlayable: isWebGL,
      sceneData: {
        originalFileName: file.name,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        bucket,
      },
      createdBy: userId,
    })
    .returning();

  // Add tags if provided
  if (metadata.tags && metadata.tags.length > 0) {
    await db.insert(schema.sceneTags).values(
      metadata.tags.map((tag) => ({
        gameSceneId: scene.id,
        tag: tag.toLowerCase().trim(),
      }))
    );
  }

  return { scene, publicUrl };
}

/**
 * Get all scenes for a game
 */
export async function getScenesByGame(gameId: string) {
  return db.query.gameScenes.findMany({
    where: eq(schema.gameScenes.gameId, gameId),
    orderBy: [desc(schema.gameScenes.createdAt)],
    with: {
      tags: true,
      creator: {
        columns: { id: true, name: true, email: true },
      },
    },
  });
}

/**
 * Get a scene by ID
 */
export async function getScene(sceneId: string) {
  return db.query.gameScenes.findFirst({
    where: eq(schema.gameScenes.id, sceneId),
    with: {
      tags: true,
      creator: true,
      game: true,
    },
  });
}

/**
 * Update a scene
 */
export async function updateScene(
  sceneId: string,
  data: Partial<{
    name: string;
    description: string;
    status: string;
    isPublic: boolean;
  }>
) {
  const [updated] = await db
    .update(schema.gameScenes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.gameScenes.id, sceneId))
    .returning();
  return updated;
}

/**
 * Delete a scene and its associated files
 */
export async function deleteScene(sceneId: string): Promise<void> {
  const scene = await db.query.gameScenes.findFirst({
    where: eq(schema.gameScenes.id, sceneId),
  });

  if (!scene) return;

  // Delete file from storage if it exists
  if (scene.bucketPath && (scene.storageType === "supabase" || scene.storageType === "minio")) {
    const sceneData = scene.sceneData as { bucket?: string } | null;
    const bucket = sceneData?.bucket || getBucketForFile(scene.bucketPath);

    try {
      await deleteFile(bucket, scene.bucketPath);
    } catch (error) {
      console.error("Failed to delete scene file:", error);
    }
  }

  // Delete from database (tags will be cascade deleted)
  await db.delete(schema.gameScenes).where(eq(schema.gameScenes.id, sceneId));
}

/**
 * Delete all scenes for a game
 */
export async function deleteGameScenes(gameId: string): Promise<void> {
  const scenes = await db.query.gameScenes.findMany({
    where: eq(schema.gameScenes.gameId, gameId),
  });

  // Delete files from storage
  for (const scene of scenes) {
    if (scene.bucketPath && (scene.storageType === "supabase" || scene.storageType === "minio")) {
      const sceneData = scene.sceneData as { bucket?: string } | null;
      const bucket = sceneData?.bucket || getBucketForFile(scene.bucketPath);

      try {
        await deleteFile(bucket, scene.bucketPath);
      } catch (error) {
        console.error("Failed to delete scene file:", error);
      }
    }
  }

  // Delete all scenes for the game from database
  await db.delete(schema.gameScenes).where(eq(schema.gameScenes.gameId, gameId));
}

/**
 * Add tags to a scene
 */
export async function addSceneTags(sceneId: string, tags: string[]) {
  if (tags.length === 0) return;

  await db.insert(schema.sceneTags).values(
    tags.map((tag) => ({
      gameSceneId: sceneId,
      tag: tag.toLowerCase().trim(),
    }))
  );
}

/**
 * Remove all tags from a scene
 */
export async function clearSceneTags(sceneId: string) {
  await db
    .delete(schema.sceneTags)
    .where(eq(schema.sceneTags.gameSceneId, sceneId));
}

/**
 * Update scene tags (replace all)
 */
export async function updateSceneTags(sceneId: string, tags: string[]) {
  await clearSceneTags(sceneId);
  if (tags.length > 0) {
    await addSceneTags(sceneId, tags);
  }
}
