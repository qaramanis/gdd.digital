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

export const gddSectionsRelations = relations(gddSections, ({ one, many }) => ({
  game: one(games, {
    fields: [gddSections.gameId],
    references: [games.id],
  }),
  lastEditor: one(user, {
    fields: [gddSections.lastEditedBy],
    references: [user.id],
  }),
  comments: many(gddComments),
}));

// Stores comments for each subsection
export const gddComments = pgTable("gdd_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  sectionSlug: text("section_slug").notNull(), // e.g., "overview", "game-concept"
  subSectionSlug: text("sub_section_slug").notNull(), // e.g., "brief_introduction"
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gddCommentsRelations = relations(gddComments, ({ one }) => ({
  game: one(games, {
    fields: [gddComments.gameId],
    references: [games.id],
  }),
  author: one(user, {
    fields: [gddComments.authorId],
    references: [user.id],
  }),
}));
