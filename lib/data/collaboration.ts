import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { GameRole } from "@/database/drizzle/schema/collaboration";

// Invitations

/**
 * Decline an invitation
 */
export async function declineInvitation(invitationId: string): Promise<void> {
  await db
    .update(schema.invitations)
    .set({ status: "declined", respondedAt: new Date() })
    .where(eq(schema.invitations.id, invitationId));
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string) {
  return db.query.invitations.findFirst({
    where: eq(schema.invitations.token, token),
    with: {
      game: true,
      inviter: true,
    },
  });
}

/**
 * Get pending invitations for a user (by email)
 */
export async function getPendingInvitations(email: string) {
  return db.query.invitations.findMany({
    where: and(
      eq(schema.invitations.inviteeEmail, email),
      eq(schema.invitations.status, "pending")
    ),
    with: {
      game: true,
      inviter: true,
    },
    orderBy: [desc(schema.invitations.createdAt)],
  });
}

// Activity Log

/**
 * Log an activity
 */
export async function logActivity(data: {
  userId: string;
  action: string;
  details?: any;
  gameId?: string;
}) {
  await db.insert(schema.activityLog).values(data);
}

/**
 * Get activity log for a user
 */
export async function getUserActivityLog(userId: string, limit?: number) {
  return db.query.activityLog.findMany({
    where: eq(schema.activityLog.userId, userId),
    orderBy: [desc(schema.activityLog.createdAt)],
    limit,
    with: {
      game: true,
    },
  });
}

// Game Members

/**
 * Get all members of a game (including owner)
 */
export async function getGameMembers(gameId: string) {
  const members = await db.query.gameMembers.findMany({
    where: eq(schema.gameMembers.gameId, gameId),
    with: {
      user: true,
      inviter: true,
    },
    orderBy: [desc(schema.gameMembers.joinedAt)],
  });
  return members;
}

/**
 * Get game member count
 */
export async function getGameMemberCount(gameId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.gameMembers)
    .where(eq(schema.gameMembers.gameId, gameId));
  return Number(result[0]?.count ?? 0);
}

/**
 * Check if a user has access to a game (owner or member)
 */
export async function hasGameAccess(
  gameId: string,
  userId: string
): Promise<{ hasAccess: boolean; role: GameRole | "owner" | null }> {
  // Check if user is the game owner
  const game = await db.query.games.findFirst({
    where: eq(schema.games.id, gameId),
    columns: { userId: true },
  });

  if (game?.userId === userId) {
    return { hasAccess: true, role: "owner" };
  }

  // Check if user is a member
  const member = await db.query.gameMembers.findFirst({
    where: and(
      eq(schema.gameMembers.gameId, gameId),
      eq(schema.gameMembers.userId, userId)
    ),
  });

  if (member) {
    return { hasAccess: true, role: member.role };
  }

  return { hasAccess: false, role: null };
}

/**
 * Add a member to a game
 */
export async function addGameMember(
  gameId: string,
  userId: string,
  role: GameRole,
  invitedBy: string
) {
  const [member] = await db
    .insert(schema.gameMembers)
    .values({
      gameId,
      userId,
      role,
      invitedBy,
    })
    .returning();
  return member;
}

/**
 * Update a game member's role
 */
export async function updateGameMemberRole(
  gameId: string,
  userId: string,
  role: GameRole
) {
  const [updated] = await db
    .update(schema.gameMembers)
    .set({ role, updatedAt: new Date() })
    .where(
      and(
        eq(schema.gameMembers.gameId, gameId),
        eq(schema.gameMembers.userId, userId)
      )
    )
    .returning();
  return updated;
}

/**
 * Remove a member from a game
 */
export async function removeGameMember(gameId: string, userId: string) {
  await db
    .delete(schema.gameMembers)
    .where(
      and(
        eq(schema.gameMembers.gameId, gameId),
        eq(schema.gameMembers.userId, userId)
      )
    );
}

/**
 * Send a game invitation
 */
export async function sendGameInvitation(
  gameId: string,
  inviterId: string,
  inviteeEmail: string,
  role: GameRole,
  message?: string
): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const [invitation] = await db
    .insert(schema.invitations)
    .values({
      gameId,
      inviterId,
      inviteeEmail,
      role,
      message,
      token,
      expiresAt,
      status: "pending",
    })
    .returning();

  return invitation.token!;
}

/**
 * Get pending game invitations for a user (by email)
 */
export async function getPendingGameInvitations(email: string) {
  return db.query.invitations.findMany({
    where: and(
      eq(schema.invitations.inviteeEmail, email),
      eq(schema.invitations.status, "pending"),
      sql`${schema.invitations.gameId} IS NOT NULL`
    ),
    with: {
      game: true,
      inviter: true,
    },
    orderBy: [desc(schema.invitations.createdAt)],
  });
}

/**
 * Accept a game invitation
 */
export async function acceptGameInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  const invitation = await db.query.invitations.findFirst({
    where: eq(schema.invitations.id, invitationId),
  });

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer valid");
  }

  if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
    await db
      .update(schema.invitations)
      .set({ status: "expired" })
      .where(eq(schema.invitations.id, invitationId));
    throw new Error("Invitation has expired");
  }

  if (!invitation.gameId) {
    throw new Error("Invalid game invitation");
  }

  await db.transaction(async (tx) => {
    // Update invitation status
    await tx
      .update(schema.invitations)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(schema.invitations.id, invitationId));

    // Add user as game member
    await tx.insert(schema.gameMembers).values({
      gameId: invitation.gameId!,
      userId,
      role: invitation.role || "viewer",
      invitedBy: invitation.inviterId,
    });
  });
}

/**
 * Get games where user is a member (not owner)
 */
export async function getSharedGames(userId: string) {
  const memberships = await db.query.gameMembers.findMany({
    where: eq(schema.gameMembers.userId, userId),
    with: {
      game: {
        with: {
          user: true,
        },
      },
    },
    orderBy: [desc(schema.gameMembers.joinedAt)],
  });

  return memberships.map((m) => ({
    ...m.game,
    role: m.role,
    joinedAt: m.joinedAt,
  }));
}

/**
 * Get the most recent activity for a game (last editor)
 */
export async function getGameRecentActivity(gameId: string) {
  // Check GDD sections for last editor
  const recentSection = await db.query.gddSections.findFirst({
    where: eq(schema.gddSections.gameId, gameId),
    orderBy: [desc(schema.gddSections.updatedAt)],
    with: {
      lastEditor: true,
    },
  });

  return recentSection;
}
