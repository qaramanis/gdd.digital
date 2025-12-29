import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";
import { games } from "./games";
import { teams } from "./teams";

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  data: jsonb("data"),
  read: boolean("read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  gameId: uuid("game_id").references(() => games.id),
  teamId: uuid("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(user, {
    fields: [activityLog.userId],
    references: [user.id],
  }),
  game: one(games, {
    fields: [activityLog.gameId],
    references: [games.id],
  }),
  team: one(teams, {
    fields: [activityLog.teamId],
    references: [teams.id],
  }),
}));
