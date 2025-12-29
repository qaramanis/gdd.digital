"use server";

import { db } from "@/database/drizzle";
import { gddSections, gddComments, user } from "@/database/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export interface GDDSectionContent {
  [subSectionId: string]: string;
}

export interface SaveGDDSectionResult {
  success: boolean;
  error?: string;
  updatedAt?: string;
}

export interface GetGDDSectionResult {
  success: boolean;
  content?: GDDSectionContent;
  error?: string;
}

export async function saveGDDSection(
  gameId: string,
  sectionSlug: string,
  content: GDDSectionContent,
  userId: string
): Promise<SaveGDDSectionResult> {
  try {
    // Check if section already exists
    const existing = await db
      .select()
      .from(gddSections)
      .where(
        and(
          eq(gddSections.gameId, gameId),
          eq(gddSections.sectionSlug, sectionSlug)
        )
      )
      .limit(1);

    const now = new Date();

    if (existing.length > 0) {
      // Update existing section
      await db
        .update(gddSections)
        .set({
          content,
          lastEditedBy: userId,
          updatedAt: now,
        })
        .where(eq(gddSections.id, existing[0].id));
    } else {
      // Create new section
      await db.insert(gddSections).values({
        gameId,
        sectionSlug,
        content,
        lastEditedBy: userId,
      });
    }

    return {
      success: true,
      updatedAt: now.toISOString(),
    };
  } catch (error) {
    console.error("Error saving GDD section:", error);
    return {
      success: false,
      error: "Failed to save section content",
    };
  }
}

export async function getGDDSection(
  gameId: string,
  sectionSlug: string
): Promise<GetGDDSectionResult> {
  try {
    const result = await db
      .select()
      .from(gddSections)
      .where(
        and(
          eq(gddSections.gameId, gameId),
          eq(gddSections.sectionSlug, sectionSlug)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return {
        success: true,
        content: {},
      };
    }

    return {
      success: true,
      content: (result[0].content as GDDSectionContent) || {},
    };
  } catch (error) {
    console.error("Error fetching GDD section:", error);
    return {
      success: false,
      error: "Failed to fetch section content",
    };
  }
}

export async function getAllGDDSections(
  gameId: string
): Promise<{ success: boolean; sections?: Record<string, GDDSectionContent>; error?: string }> {
  try {
    const results = await db
      .select()
      .from(gddSections)
      .where(eq(gddSections.gameId, gameId));

    const sections: Record<string, GDDSectionContent> = {};
    for (const row of results) {
      sections[row.sectionSlug] = (row.content as GDDSectionContent) || {};
    }

    return {
      success: true,
      sections,
    };
  } catch (error) {
    console.error("Error fetching all GDD sections:", error);
    return {
      success: false,
      error: "Failed to fetch GDD sections",
    };
  }
}

// Comment types
export interface GDDComment {
  id: string;
  gameId: string;
  sectionSlug: string;
  subSectionSlug: string;
  content: string;
  authorId: string;
  authorName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Create a new comment for a subsection
export async function createGDDComment(
  gameId: string,
  sectionSlug: string,
  subSectionSlug: string,
  content: string,
  userId: string
): Promise<{ success: boolean; comment?: GDDComment; error?: string }> {
  try {
    // Create new comment
    const [created] = await db
      .insert(gddComments)
      .values({
        gameId,
        sectionSlug,
        subSectionSlug,
        content,
        authorId: userId,
      })
      .returning();

    // Get author name
    const authorResult = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return {
      success: true,
      comment: {
        ...created,
        authorName: authorResult[0]?.name || null,
      } as GDDComment,
    };
  } catch (error) {
    console.error("Error creating GDD comment:", error);
    return {
      success: false,
      error: "Failed to create comment",
    };
  }
}

// Get comment for a specific subsection
export async function getGDDComment(
  gameId: string,
  sectionSlug: string,
  subSectionSlug: string,
  userId: string
): Promise<{ success: boolean; comment?: GDDComment | null; error?: string }> {
  try {
    const result = await db
      .select()
      .from(gddComments)
      .where(
        and(
          eq(gddComments.gameId, gameId),
          eq(gddComments.sectionSlug, sectionSlug),
          eq(gddComments.subSectionSlug, subSectionSlug),
          eq(gddComments.authorId, userId)
        )
      )
      .limit(1);

    return {
      success: true,
      comment: result.length > 0 ? (result[0] as GDDComment) : null,
    };
  } catch (error) {
    console.error("Error fetching GDD comment:", error);
    return {
      success: false,
      error: "Failed to fetch comment",
    };
  }
}

// Get all comments for a game section (all subsections) - returns arrays per subsection
export async function getGDDSectionComments(
  gameId: string,
  sectionSlug: string
): Promise<{ success: boolean; comments?: Record<string, GDDComment[]>; error?: string }> {
  try {
    const results = await db
      .select({
        id: gddComments.id,
        gameId: gddComments.gameId,
        sectionSlug: gddComments.sectionSlug,
        subSectionSlug: gddComments.subSectionSlug,
        content: gddComments.content,
        authorId: gddComments.authorId,
        authorName: user.name,
        createdAt: gddComments.createdAt,
        updatedAt: gddComments.updatedAt,
      })
      .from(gddComments)
      .leftJoin(user, eq(gddComments.authorId, user.id))
      .where(
        and(
          eq(gddComments.gameId, gameId),
          eq(gddComments.sectionSlug, sectionSlug)
        )
      )
      .orderBy(desc(gddComments.createdAt));

    const comments: Record<string, GDDComment[]> = {};
    for (const row of results) {
      if (!comments[row.subSectionSlug]) {
        comments[row.subSectionSlug] = [];
      }
      comments[row.subSectionSlug].push(row as GDDComment);
    }

    return {
      success: true,
      comments,
    };
  } catch (error) {
    console.error("Error fetching GDD section comments:", error);
    return {
      success: false,
      error: "Failed to fetch comments",
    };
  }
}

// Update a comment
export async function updateGDDComment(
  commentId: string,
  content: string,
  userId: string
): Promise<{ success: boolean; comment?: GDDComment; error?: string }> {
  try {
    const [updated] = await db
      .update(gddComments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(gddComments.id, commentId),
          eq(gddComments.authorId, userId)
        )
      )
      .returning();

    if (!updated) {
      return {
        success: false,
        error: "Comment not found or not authorized",
      };
    }

    // Get author name
    const authorResult = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return {
      success: true,
      comment: {
        ...updated,
        authorName: authorResult[0]?.name || null,
      } as GDDComment,
    };
  } catch (error) {
    console.error("Error updating GDD comment:", error);
    return {
      success: false,
      error: "Failed to update comment",
    };
  }
}

// Delete a comment
export async function deleteGDDComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .delete(gddComments)
      .where(
        and(
          eq(gddComments.id, commentId),
          eq(gddComments.authorId, userId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting GDD comment:", error);
    return {
      success: false,
      error: "Failed to delete comment",
    };
  }
}
