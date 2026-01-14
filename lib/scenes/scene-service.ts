import "server-only";

import {
  uploadScene as uploadSceneData,
  getScenesByGame as getScenesByGameData,
  deleteScene as deleteSceneData,
  updateScene as updateSceneData,
  addSceneTags,
  getScene,
} from "@/lib/data/scenes";
import { db, schema } from "@/database/drizzle";

export interface SceneMetadata {
  name: string;
  description?: string;
  engine: "unity" | "unreal" | "godot" | "custom";
  engineVersion?: string;
  tags?: string[];
}

export interface Scene {
  id: string;
  gameId: string;
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
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy: string;
  tags?: { tag: string }[];
}

export class SceneService {
  static async uploadScene(
    gameId: string,
    file: File,
    metadata: SceneMetadata,
    userId: string
  ) {
    try {
      const result = await uploadSceneData(gameId, file, metadata, userId);
      return { success: true, scene: result.scene };
    } catch (error) {
      console.error("Scene upload error:", error);
      return { success: false, error };
    }
  }

  static async linkExternalScene(
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
          name: metadata.name,
          description: metadata.description,
          engine: metadata.engine,
          engineVersion: metadata.engineVersion,
          storageType: "external",
          sceneUrl: externalUrl,
          createdBy: userId,
        })
        .returning();

      if (scene && metadata.tags && metadata.tags.length > 0) {
        await addSceneTags(scene.id, metadata.tags);
      }

      return { data: scene, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getScenesByGame(gameId: string) {
    try {
      const scenes = await getScenesByGameData(gameId);
      return { data: scenes, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async deleteScene(sceneId: string) {
    try {
      await deleteSceneData(sceneId);
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  static async updateScene(sceneId: string, updates: Partial<Scene>) {
    try {
      const scene = await updateSceneData(sceneId, {
        name: updates.name,
        description: updates.description ?? undefined,
        status: updates.status ?? undefined,
        isPublic: updates.isPublic ?? undefined,
      });
      return { data: scene, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
