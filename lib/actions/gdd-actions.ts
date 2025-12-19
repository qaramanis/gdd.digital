"use server";

import { db } from "@/database/drizzle";
import { gddSections } from "@/database/drizzle/schema";
import { eq, and } from "drizzle-orm";

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
