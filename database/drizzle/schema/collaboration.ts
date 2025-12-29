import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";
import { teams } from "./teams";
import { games } from "./games";

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").references(() => teams.id, { onDelete: "cascade" }),
  gameId: uuid("game_id").references(() => games.id, { onDelete: "cascade" }),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id),
  inviteeEmail: text("invitee_email").notNull(),
  permission: text("permission").notNull().default("viewer"),
  status: text("status").notNull().default("pending"),
  token: uuid("token").defaultRandom().unique(),
  message: text("message"),
  canShare: boolean("can_share").default(false),
  expiresAt: timestamp("expires_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  game: one(games, {
    fields: [invitations.gameId],
    references: [games.id],
  }),
  inviter: one(user, {
    fields: [invitations.inviterId],
    references: [user.id],
  }),
}));
