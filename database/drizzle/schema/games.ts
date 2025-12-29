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
  startDate: text("start_date"),
  timeline: text("timeline"),
  sections: jsonb("sections").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(user, {
    fields: [games.userId],
    references: [user.id],
  }),
}));
