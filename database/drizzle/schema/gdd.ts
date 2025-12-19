import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { games } from "./games";
import { user } from "./users";

// Stores GDD section content for each game
// Each row represents a section (e.g., "overview", "game-concept") with sub-section content
export const gddSections = pgTable(
  "gdd_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    sectionSlug: text("section_slug").notNull(), // e.g., "overview", "game-concept"
    // Store all sub-section content as JSON: { "brief_introduction": "<html>", "game_concept_summary": "<html>", ... }
    content: jsonb("content").$type<Record<string, string>>().default({}),
    lastEditedBy: text("last_edited_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // Ensure each game has only one entry per section
    gameSection: unique().on(table.gameId, table.sectionSlug),
  })
);

export const gddSectionsRelations = relations(gddSections, ({ one }) => ({
  game: one(games, {
    fields: [gddSections.gameId],
    references: [games.id],
  }),
  lastEditor: one(user, {
    fields: [gddSections.lastEditedBy],
    references: [user.id],
  }),
}));
