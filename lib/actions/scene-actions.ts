"use server";

import {
  uploadScene as uploadSceneData,
  getScenesByGame as getScenesByGameData,
  deleteScene as deleteSceneData,
  updateScene as updateSceneData,
  addSceneTags,
} from "@/lib/data/scenes";
import { db, schema } from "@/database/drizzle";

export interface SceneMetadata {
  name: string;
  description?: string;
  engine: "unity" | "unreal" | "godot" | "custom";
  engineVersion?: string;
  sectionId?: string;
  tags?: string[];
}

export interface Scene {
  id: string;
  gameId: string;
  documentSectionId?: string | null;
  name: string;
  description?: string | null;
  engine: string;
  engineVersion?: string | null;
  storageType: string | null;
  sceneUrl?: string | null;
  bucketPath?: string | null;
  thumbnailUrl?: string | null;
  fileSize?: number | null;
  fileFormat?: string | null;
  sceneData?: any;
  version: number | null;
  status: string | null;
  isPublic: boolean | null;
  isPlayable: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string;
  tags?: { tag: string }[];
  section?: { title: string } | null;
}

export async function getScenesByGame(gameId: string) {
  try {
    const scenes = await getScenesByGameData(gameId);
    return { data: scenes, error: null };
  } catch (error) {
    console.error("Error fetching scenes:", error);
    return { data: null, error: "Failed to fetch scenes" };
  }
}

export async function uploadScene(
  gameId: string,
  fileData: {
    buffer: number[];
    name: string;
    type: string;
    size: number;
  },
  metadata: SceneMetadata,
  userId: string
) {
  try {
    // Convert buffer back to File-like object for the data layer
    const buffer = Buffer.from(fileData.buffer);
    const file = new File([buffer], fileData.name, { type: fileData.type });

    const result = await uploadSceneData(gameId, file, metadata, userId);
    return { success: true, scene: result.scene };
  } catch (error) {
    console.error("Scene upload error:", error);
    return { success: false, error: "Failed to upload scene" };
  }
}

export async function linkExternalScene(
  gameId: string,
  externalUrl: string,
  metadata: SceneMetadata,
  userId: string
) {
  try {
    const [scene] = await db
      .insert(schema.gameScenes)
      .values({
        gameId,
        documentSectionId: metadata.sectionId,
        name: metadata.name,
        description: metadata.description,
        engine: metadata.engine,
        engineVersion: metadata.engineVersion,
        storageType: "external",
        sceneUrl: externalUrl,
        isPlayable: true,
        createdBy: userId,
      })
      .returning();

    if (scene && metadata.tags && metadata.tags.length > 0) {
      await addSceneTags(scene.id, metadata.tags);
    }

    return { data: scene, error: null };
  } catch (error) {
    console.error("Error linking external scene:", error);
    return { data: null, error: "Failed to link external scene" };
  }
}

export async function deleteScene(sceneId: string) {
  try {
    await deleteSceneData(sceneId);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting scene:", error);
    return { success: false, error: "Failed to delete scene" };
  }
}

export async function updateScene(sceneId: string, updates: Partial<Scene>) {
  try {
    const scene = await updateSceneData(sceneId, {
      name: updates.name,
      description: updates.description ?? undefined,
      documentSectionId: updates.documentSectionId ?? undefined,
      status: updates.status ?? undefined,
      isPublic: updates.isPublic ?? undefined,
    });
    return { data: scene, error: null };
  } catch (error) {
    console.error("Error updating scene:", error);
    return { data: null, error: "Failed to update scene" };
  }
}
