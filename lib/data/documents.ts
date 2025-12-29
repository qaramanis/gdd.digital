import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, desc } from "drizzle-orm";

export interface DocumentData {
  gameId?: string;
  title: string;
  userId: string;
  teamId?: string;
  isGameDocument?: boolean;
}

/**
 * Get a document by ID
 */
export async function getDocument(documentId: string) {
  return db.query.documents.findFirst({
    where: eq(schema.documents.id, documentId),
    with: {
      game: true,
      user: true,
    },
  });
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(userId: string) {
  return db.query.documents.findMany({
    where: eq(schema.documents.userId, userId),
    orderBy: [desc(schema.documents.updatedAt)],
    with: {
      game: true,
    },
  });
}

/**
 * Create a new document
 */
export async function createDocument(data: DocumentData) {
  const [doc] = await db.insert(schema.documents).values(data).returning();
  return doc;
}

/**
 * Update a document
 */
export async function updateDocument(
  documentId: string,
  data: Partial<Pick<DocumentData, "title">>
) {
  const [updated] = await db
    .update(schema.documents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.documents.id, documentId))
    .returning();
  return updated;
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string) {
  const [deleted] = await db
    .delete(schema.documents)
    .where(eq(schema.documents.id, documentId))
    .returning();
  return deleted;
}
