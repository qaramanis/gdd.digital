import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, desc, and } from "drizzle-orm";

export interface NoteData {
  userId: string;
  title?: string;
  content?: string;
  tags?: string[];
  game?: string;
}

/**
 * Get all notes for a user
 */
export async function getUserNotes(userId: string, limit?: number) {
  return db.query.notes.findMany({
    where: eq(schema.notes.userId, userId),
    orderBy: [desc(schema.notes.createdAt)],
    limit: limit,
  });
}

/**
 * Get a specific note by ID
 */
export async function getNote(noteId: string) {
  return db.query.notes.findFirst({
    where: eq(schema.notes.id, noteId),
  });
}

/**
 * Get a note with permission check
 */
export async function getNoteForUser(noteId: string, userId: string) {
  return db.query.notes.findFirst({
    where: and(eq(schema.notes.id, noteId), eq(schema.notes.userId, userId)),
  });
}

/**
 * Create a new note
 */
export async function createNote(data: NoteData) {
  const [note] = await db.insert(schema.notes).values(data).returning();
  return note;
}

/**
 * Update a note
 */
export async function updateNote(
  noteId: string,
  userId: string,
  data: Partial<Omit<NoteData, "userId">>
) {
  const [updated] = await db
    .update(schema.notes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(schema.notes.id, noteId), eq(schema.notes.userId, userId)))
    .returning();
  return updated;
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: string, userId: string) {
  const [deleted] = await db
    .delete(schema.notes)
    .where(and(eq(schema.notes.id, noteId), eq(schema.notes.userId, userId)))
    .returning();
  return deleted;
}

/**
 * Get notes filtered by tag
 */
export async function getNotesByTag(userId: string, tag: string) {
  const notes = await db.query.notes.findMany({
    where: eq(schema.notes.userId, userId),
    orderBy: [desc(schema.notes.createdAt)],
  });

  // Filter by tag (tags is a JSONB array)
  return notes.filter((note) => note.tags?.includes(tag));
}

/**
 * Get notes filtered by game
 */
export async function getNotesByGame(userId: string, game: string) {
  return db.query.notes.findMany({
    where: and(eq(schema.notes.userId, userId), eq(schema.notes.game, game)),
    orderBy: [desc(schema.notes.createdAt)],
  });
}
