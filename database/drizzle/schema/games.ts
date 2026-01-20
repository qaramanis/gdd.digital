import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";

export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  concept: text("concept"),
  genre: text("genre"),
  startDate: text("start_date"),
  timeline: text("timeline"),
  sections: jsonb("sections").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameMechanics = pgTable("game_mechanics", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(user, {
    fields: [games.userId],
    references: [user.id],
  }),
  mechanics: many(gameMechanics),
}));

export const gameMechanicsRelations = relations(gameMechanics, ({ one }) => ({
  game: one(games, {
    fields: [gameMechanics.gameId],
    references: [games.id],
  }),
}));
