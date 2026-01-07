import "server-only";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Check if we should use Supabase (production) or MinIO (development)
const useSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Supabase client (lazy loaded)
let supabaseAdmin: ReturnType<typeof import("@supabase/supabase-js").createClient> | null = null;

async function getSupabaseAdmin() {
  if (!supabaseAdmin && useSupabase) {
    const { createClient } = await import("@supabase/supabase-js");
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return supabaseAdmin;
}

// MinIO/S3 client for local development
const minioEndpoint = process.env.MINIO_ENDPOINT || "localhost";
const minioPort = process.env.MINIO_PORT || "9000";
const minioUseSsl = process.env.MINIO_USE_SSL === "true";
const minioProtocol = minioUseSsl ? "https" : "http";
const minioInternalEndpoint = `${minioProtocol}://${minioEndpoint}:${minioPort}`;
const minioPublicUrl = process.env.MINIO_PUBLIC_URL || minioInternalEndpoint;

const s3Client = new S3Client({
  endpoint: minioInternalEndpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true,
});

export const BUCKETS = {
  GAME_IMAGES: process.env.MINIO_BUCKET_GAME_IMAGES || "game-images",
  SCENES_WEBGL: process.env.MINIO_BUCKET_SCENES_WEBGL || "game-scenes-webgl",
  SCENE_FILES: process.env.MINIO_BUCKET_SCENE_FILES || "game-scene-files",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file to storage (Supabase in production, MinIO in development)
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

  if (useSupabase) {
    // Production: Use Supabase Storage
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase.storage.from(bucket).upload(key, body, {
      contentType,
      cacheControl: options?.cacheControl || "3600",
      upsert: options?.upsert ?? true,
    });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  } else {
    // Development: Use MinIO
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: options?.cacheControl || "max-age=3600",
    });

    await s3Client.send(command);
  }

  return getPublicUrl(bucket, key);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, key: string): Promise<void> {
  if (useSupabase) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase.storage.from(bucket).remove([key]);
    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  } else {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
  }
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(
  bucket: string,
  keys: string[]
): Promise<void> {
  if (keys.length === 0) return;

  if (useSupabase) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { error } = await supabase.storage.from(bucket).remove(keys);
    if (error) {
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  } else {
    const command = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });
    await s3Client.send(command);
  }
}

/**
 * Delete all files in a folder (prefix)
 */
export async function deleteFolder(
  bucket: string,
  prefix: string
): Promise<void> {
  if (useSupabase) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(prefix);

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (files && files.length > 0) {
      const keys = files.map((file) => `${prefix}/${file.name}`);
      await deleteFiles(bucket, keys);
    }
  } else {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const listResult = await s3Client.send(listCommand);

    if (listResult.Contents && listResult.Contents.length > 0) {
      const keys = listResult.Contents.map((obj) => obj.Key!).filter(Boolean);
      await deleteFiles(bucket, keys);
    }
  }
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(bucket: string, key: string): string {
  if (useSupabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;
  } else {
    return `${minioPublicUrl}/${bucket}/${key}`;
  }
}

/**
 * Get a signed URL for downloading a file (for private buckets)
 */
export async function getSignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<string> {
  if (useSupabase) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(key, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } else {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }
}

/**
 * Get a signed URL for uploading a file (for client-side uploads)
 */
export async function getSignedUploadUrl(
  bucket: string,
  key: string,
  contentType?: string,
  expiresIn = 3600
): Promise<string> {
  if (useSupabase) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(key);

    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }

    return data.signedUrl;
  } else {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(
  bucket: string,
  key: string
): Promise<boolean> {
  if (useSupabase) {
    const supabase = await getSupabaseAdmin();
    if (!supabase) throw new Error("Supabase client not initialized");

    const pathParts = key.split("/");
    const fileName = pathParts.pop();
    const folder = pathParts.join("/");

    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: 1,
      search: fileName,
    });

    return !error && data && data.length > 0;
  } else {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }
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

/**
 * Check which storage backend is being used
 */
export function getStorageBackend(): "supabase" | "minio" {
  return useSupabase ? "supabase" : "minio";
}
