import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export const BUCKETS = {
  GAME_IMAGES: process.env.MINIO_BUCKET_GAME_IMAGES || "game-images",
  SCENES_WEBGL: process.env.MINIO_BUCKET_SCENES_WEBGL || "game-scenes-webgl",
  SCENE_FILES: process.env.MINIO_BUCKET_SCENE_FILES || "game-scene-files",
  CHARACTER_MODELS: process.env.MINIO_BUCKET_CHARACTER_MODELS || "character-models",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  bucket: string,
  key: string,
  file: Buffer | Blob | ArrayBuffer,
  contentType: string,
  options?: { cacheControl?: string; upsert?: boolean }
): Promise<string> {
  let body: Buffer;

  if (file instanceof Blob) {
    body = Buffer.from(await file.arrayBuffer());
  } else if (file instanceof ArrayBuffer) {
    body = Buffer.from(file);
  } else {
    body = file;
  }

  const { error } = await supabaseAdmin.storage.from(bucket).upload(key, body, {
    contentType,
    cacheControl: options?.cacheControl || "3600",
    upsert: options?.upsert ?? true,
  });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return getPublicUrl(bucket, key);
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(bucket: string, key: string): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([key]);
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Delete multiple files from Supabase storage
 */
export async function deleteFiles(
  bucket: string,
  keys: string[]
): Promise<void> {
  if (keys.length === 0) return;

  const { error } = await supabaseAdmin.storage.from(bucket).remove(keys);
  if (error) {
    throw new Error(`Failed to delete files: ${error.message}`);
  }
}

/**
 * Delete all files in a folder (prefix)
 */
export async function deleteFolder(
  bucket: string,
  prefix: string
): Promise<void> {
  const { data: files, error: listError } = await supabaseAdmin.storage
    .from(bucket)
    .list(prefix);

  if (listError) {
    throw new Error(`Failed to list files: ${listError.message}`);
  }

  if (files && files.length > 0) {
    const keys = files.map((file) => `${prefix}/${file.name}`);
    await deleteFiles(bucket, keys);
  }
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(bucket: string, key: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}

/**
 * Get a signed URL for downloading a file (for private buckets)
 */
export async function getSignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(key, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Get a signed URL for uploading a file (for client-side uploads)
 */
export async function getSignedUploadUrl(
  bucket: string,
  key: string,
  _contentType?: string,
  _expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUploadUrl(key);

  if (error) {
    throw new Error(`Failed to create signed upload URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Check if a file exists
 */
export async function fileExists(
  bucket: string,
  key: string
): Promise<boolean> {
  const pathParts = key.split("/");
  const fileName = pathParts.pop();
  const folder = pathParts.join("/");

  const { data, error } = await supabaseAdmin.storage.from(bucket).list(folder, {
    limit: 1,
    search: fileName,
  });

  return !error && data && data.length > 0;
}

/**
 * Determine the appropriate bucket for a file based on extension
 */
export function getBucketForFile(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const webGLExtensions = ["html", "data", "wasm", "js"];

  if (webGLExtensions.includes(ext || "")) {
    return BUCKETS.SCENES_WEBGL;
  }
  return BUCKETS.SCENE_FILES;
}
