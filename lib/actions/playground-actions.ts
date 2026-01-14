"use server";

import { db, schema } from "@/database/drizzle";
import { eq } from "drizzle-orm";

export async function fetchScene(sceneId: string) {
  try {
    const scene = await db.query.gameScenes.findFirst({
      where: eq(schema.gameScenes.id, sceneId),
    });

    if (!scene) return null;

    return {
      id: scene.id,
      game_id: scene.gameId,
      name: scene.name,
      description: scene.description,
      engine: scene.engine,
      scene_url: scene.sceneUrl,
      file_format: scene.fileFormat,
      created_at: scene.createdAt?.toISOString() || "",
    };
  } catch (error) {
    console.error("Error fetching scene:", error);
    return null;
  }
}

export async function fetchGameScenes(gameId: string) {
  try {
    const scenes = await db.query.gameScenes.findMany({
      where: eq(schema.gameScenes.gameId, gameId),
      orderBy: (scenes, { desc }) => [desc(scenes.createdAt)],
    });

    return scenes.map(scene => ({
      id: scene.id,
      game_id: scene.gameId,
      name: scene.name,
      description: scene.description,
      engine: scene.engine,
      scene_url: scene.sceneUrl,
      file_format: scene.fileFormat,
      created_at: scene.createdAt?.toISOString() || "",
    }));
  } catch (error) {
    console.error("Error fetching game scenes:", error);
    return [];
  }
}
