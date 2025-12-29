import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, and, desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Teams

/**
 * Create a new team
 */
export async function createTeam(
  name: string,
  description: string | undefined,
  ownerId: string
) {
  const [team] = await db
    .insert(schema.teams)
    .values({
      name,
      description,
      ownerId,
    })
    .returning();

  // Add owner as team member
  await db.insert(schema.teamMembers).values({
    teamId: team.id,
    userId: ownerId,
    role: "owner",
  });

  return team;
}

/**
 * Get teams for a user
 */
export async function getTeamsByUser(userId: string) {
  const memberships = await db.query.teamMembers.findMany({
    where: eq(schema.teamMembers.userId, userId),
    with: {
      team: {
        with: {
          owner: true,
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.team,
    role: m.role,
  }));
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string) {
  return db.query.teamMembers.findMany({
    where: eq(schema.teamMembers.teamId, teamId),
    with: {
      user: true,
    },
  });
}

/**
 * Remove a team member
 */
export async function removeTeamMember(teamId: string, userId: string) {
  await db
    .delete(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.teamId, teamId),
        eq(schema.teamMembers.userId, userId)
      )
    );
}

// Invitations

/**
 * Send a team invitation
 */
export async function sendTeamInvitation(
  teamId: string,
  inviterId: string,
  inviteeEmail: string,
  role: string,
  message?: string
): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const [invitation] = await db
    .insert(schema.invitations)
    .values({
      teamId,
      inviterId,
      inviteeEmail,
      permission: role,
      message,
      token,
      expiresAt,
      status: "pending",
    })
    .returning();

  return invitation.token!;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
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

  await db.transaction(async (tx) => {
    // Update invitation status
    await tx
      .update(schema.invitations)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(schema.invitations.id, invitationId));

    // Add user as team member
    if (invitation.teamId) {
      await tx.insert(schema.teamMembers).values({
        teamId: invitation.teamId,
        userId,
        role: invitation.permission,
        invitedBy: invitation.inviterId,
      });
    }
  });
}

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
      team: true,
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
      team: true,
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
  teamId?: string;
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
