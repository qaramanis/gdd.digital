import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, and, desc, asc } from "drizzle-orm";

export interface DocumentData {
  gameId?: string;
  title: string;
  userId: string;
  teamId?: string;
  isGameDocument?: boolean;
}

export interface SectionData {
  documentId: string;
  title: string;
  content?: any;
  orderIndex?: number;
}

/**
 * Get a document by ID with its sections
 */
export async function getDocument(documentId: string) {
  return db.query.documents.findFirst({
    where: eq(schema.documents.id, documentId),
    with: {
      game: true,
      user: true,
      sections: {
        orderBy: [asc(schema.documentSections.orderIndex)],
      },
    },
  });
}

/**
 * Get a document by ID (simple, without relations)
 */
export async function getDocumentBasic(documentId: string) {
  return db.query.documents.findFirst({
    where: eq(schema.documents.id, documentId),
  });
}

/**
 * Get all documents for a game
 */
export async function getDocumentsByGame(gameId: string) {
  return db.query.documents.findMany({
    where: eq(schema.documents.gameId, gameId),
    orderBy: [desc(schema.documents.updatedAt)],
    with: {
      sections: {
        orderBy: [asc(schema.documentSections.orderIndex)],
      },
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

// Document Sections

/**
 * Get a document section by ID
 */
export async function getDocumentSection(sectionId: string) {
  return db.query.documentSections.findFirst({
    where: eq(schema.documentSections.id, sectionId),
    with: {
      document: true,
    },
  });
}

/**
 * Get all sections for a document
 */
export async function getDocumentSections(documentId: string) {
  return db.query.documentSections.findMany({
    where: eq(schema.documentSections.documentId, documentId),
    orderBy: [asc(schema.documentSections.orderIndex)],
  });
}

/**
 * Create a new document section
 */
export async function createDocumentSection(data: SectionData) {
  const [section] = await db
    .insert(schema.documentSections)
    .values(data)
    .returning();
  return section;
}

/**
 * Create multiple document sections
 */
export async function createDocumentSections(sections: SectionData[]) {
  if (sections.length === 0) return [];
  const result = await db
    .insert(schema.documentSections)
    .values(sections)
    .returning();
  return result;
}

/**
 * Update a document section
 */
export async function updateDocumentSection(
  sectionId: string,
  data: Partial<Pick<SectionData, "content" | "title" | "orderIndex">>
) {
  const [updated] = await db
    .update(schema.documentSections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.documentSections.id, sectionId))
    .returning();
  return updated;
}

/**
 * Delete a document section
 */
export async function deleteDocumentSection(sectionId: string) {
  const [deleted] = await db
    .delete(schema.documentSections)
    .where(eq(schema.documentSections.id, sectionId))
    .returning();
  return deleted;
}

/**
 * Reorder document sections
 */
export async function reorderDocumentSections(
  documentId: string,
  sectionOrders: { id: string; orderIndex: number }[]
) {
  const updates = sectionOrders.map(({ id, orderIndex }) =>
    db
      .update(schema.documentSections)
      .set({ orderIndex, updatedAt: new Date() })
      .where(
        and(
          eq(schema.documentSections.id, id),
          eq(schema.documentSections.documentId, documentId)
        )
      )
  );

  await Promise.all(updates);
}
