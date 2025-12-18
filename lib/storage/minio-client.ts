import "server-only";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Internal endpoint for server-side communication
const minioEndpoint = process.env.MINIO_ENDPOINT || "localhost";
const minioPort = process.env.MINIO_PORT || "9000";
const minioUseSsl = process.env.MINIO_USE_SSL === "true";
const minioProtocol = minioUseSsl ? "https" : "http";
const internalEndpoint = `${minioProtocol}://${minioEndpoint}:${minioPort}`;

// Public endpoint for URLs returned to the browser
const publicEndpoint = process.env.MINIO_PUBLIC_URL || internalEndpoint;

const s3Client = new S3Client({
  endpoint: internalEndpoint,
  region: "us-east-1", // Required but not used by MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
  },
  forcePathStyle: true, // Required for MinIO
});

export const BUCKETS = {
  GAME_IMAGES: process.env.MINIO_BUCKET_GAME_IMAGES || "game-images",
  SCENES_WEBGL: process.env.MINIO_BUCKET_SCENES_WEBGL || "game-scenes-webgl",
  SCENE_FILES: process.env.MINIO_BUCKET_SCENE_FILES || "game-scene-files",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Upload a file to MinIO storage
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

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: options?.cacheControl || "max-age=3600",
  });

  await s3Client.send(command);

  // Return the public URL
  return getPublicUrl(bucket, key);
}

/**
 * Delete a file from MinIO storage
 */
export async function deleteFile(bucket: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await s3Client.send(command);
}

/**
 * Delete multiple files from MinIO storage
 */
export async function deleteFiles(
  bucket: string,
  keys: string[]
): Promise<void> {
  if (keys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: keys.map((key) => ({ Key: key })),
    },
  });
  await s3Client.send(command);
}

/**
 * Delete all files in a folder (prefix)
 */
export async function deleteFolder(
  bucket: string,
  prefix: string
): Promise<void> {
  // List all objects with the prefix
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

/**
 * Get the public URL for a file (accessible from the browser)
 */
export function getPublicUrl(bucket: string, key: string): string {
  return `${publicEndpoint}/${bucket}/${key}`;
}

/**
 * Get a signed URL for downloading a file (for private buckets)
 */
export async function getSignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading a file (for client-side uploads)
 */
export async function getSignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Check if a file exists
 */
export async function fileExists(bucket: string, key: string): Promise<boolean> {
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

export { s3Client };
