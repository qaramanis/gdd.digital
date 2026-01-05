import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";
import { games } from "./games";

// Game member roles
export const GAME_ROLES = ["admin", "editor", "reviewer", "viewer"] as const;
export type GameRole = (typeof GAME_ROLES)[number];

// Game members - tracks users who have access to a specific game
export const gameMembers = pgTable("game_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").$type<GameRole>().notNull().default("viewer"),
  invitedBy: text("invited_by").references(() => user.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameMembersRelations = relations(gameMembers, ({ one }) => ({
  game: one(games, {
    fields: [gameMembers.gameId],
    references: [games.id],
  }),
  user: one(user, {
    fields: [gameMembers.userId],
    references: [user.id],
  }),
  inviter: one(user, {
    fields: [gameMembers.invitedBy],
    references: [user.id],
  }),
}));

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id").references(() => games.id, { onDelete: "cascade" }),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id),
  inviteeEmail: text("invitee_email").notNull(),
  role: text("role").$type<GameRole>().notNull().default("viewer"),
  status: text("status").$type<"pending" | "accepted" | "declined" | "expired">().notNull().default("pending"),
  token: uuid("token").defaultRandom().unique(),
  message: text("message"),
  expiresAt: timestamp("expires_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invitationsRelations = relations(invitations, ({ one }) => ({
  game: one(games, {
    fields: [invitations.gameId],
    references: [games.id],
  }),
  inviter: one(user, {
    fields: [invitations.inviterId],
    references: [user.id],
  }),
}));
