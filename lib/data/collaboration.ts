import "server-only";

import { db, schema } from "@/database/drizzle";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

type Permission = "viewer" | "commenter" | "editor" | "owner";

const PERMISSION_HIERARCHY: Permission[] = [
  "viewer",
  "commenter",
  "editor",
  "owner",
];

/**
 * Check if a user has access to a document with the required permission level
 * (Replaces the has_document_access RPC function)
 */
export async function hasDocumentAccess(
  userId: string,
  documentId: string,
  requiredPermission: Permission = "viewer"
): Promise<boolean> {
  const requiredLevel = PERMISSION_HIERARCHY.indexOf(requiredPermission);

  // Check if user owns the document
  const document = await db.query.documents.findFirst({
    where: and(
      eq(schema.documents.id, documentId),
      eq(schema.documents.userId, userId)
    ),
    columns: { id: true },
  });

  if (document) return true; // Owner has all permissions

  // Check collaborator permissions
  const collaborator = await db.query.documentCollaborators.findFirst({
    where: and(
      eq(schema.documentCollaborators.documentId, documentId),
      eq(schema.documentCollaborators.userId, userId)
    ),
  });

  if (!collaborator) return false;

  const userLevel = PERMISSION_HIERARCHY.indexOf(
    collaborator.permission as Permission
  );
  return userLevel >= requiredLevel;
}

/**
 * Send a document invitation
 * (Replaces the send_document_invitation RPC function)
 */
export async function sendDocumentInvitation(
  documentId: string,
  inviterId: string,
  inviteeEmail: string,
  permission: Exclude<Permission, "owner">,
  message?: string,
  canShare?: boolean
): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const [invitation] = await db
    .insert(schema.invitations)
    .values({
      documentId,
      inviterId,
      inviteeEmail,
      permission,
      message,
      canShare: canShare ?? false,
      token,
      expiresAt,
      status: "pending",
    })
    .returning();

  return invitation.token!;
}

/**
 * Accept an invitation
 * (Replaces the accept_invitation RPC function)
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

  // Transaction to update invitation and add collaborator
  await db.transaction(async (tx) => {
    // Update invitation status
    await tx
      .update(schema.invitations)
      .set({ status: "accepted", respondedAt: new Date() })
      .where(eq(schema.invitations.id, invitationId));

    // Add user as collaborator based on invitation type
    if (invitation.documentId) {
      await tx.insert(schema.documentCollaborators).values({
        documentId: invitation.documentId,
        userId,
        permission: invitation.permission,
        canShare: invitation.canShare ?? false,
        addedBy: invitation.inviterId,
      });
    }

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
      document: true,
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
      document: true,
      team: true,
      inviter: true,
    },
    orderBy: [desc(schema.invitations.createdAt)],
  });
}

/**
 * Get document collaborators
 */
export async function getDocumentCollaborators(documentId: string) {
  return db.query.documentCollaborators.findMany({
    where: eq(schema.documentCollaborators.documentId, documentId),
    with: {
      user: true,
    },
  });
}

/**
 * Update collaborator permission
 */
export async function updateCollaboratorPermission(
  documentId: string,
  userId: string,
  permission: Permission
) {
  const [updated] = await db
    .update(schema.documentCollaborators)
    .set({ permission })
    .where(
      and(
        eq(schema.documentCollaborators.documentId, documentId),
        eq(schema.documentCollaborators.userId, userId)
      )
    )
    .returning();
  return updated;
}

/**
 * Remove a collaborator from a document
 */
export async function removeCollaborator(documentId: string, userId: string) {
  await db
    .delete(schema.documentCollaborators)
    .where(
      and(
        eq(schema.documentCollaborators.documentId, documentId),
        eq(schema.documentCollaborators.userId, userId)
      )
    );
}

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

// Notifications

/**
 * Create a notification
 */
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message?: string;
  data?: any;
}) {
  const [notification] = await db
    .insert(schema.notifications)
    .values(data)
    .returning();
  return notification;
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limit?: number) {
  return db.query.notifications.findMany({
    where: eq(schema.notifications.userId, userId),
    orderBy: [desc(schema.notifications.createdAt)],
    limit,
  });
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string) {
  await db
    .update(schema.notifications)
    .set({ read: true, readAt: new Date() })
    .where(eq(schema.notifications.id, notificationId));
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string) {
  await db
    .update(schema.notifications)
    .set({ read: true, readAt: new Date() })
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.read, false)
      )
    );
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.notifications)
    .where(
      and(
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.read, false)
      )
    );
  return result[0]?.count || 0;
}

// Activity Log

/**
 * Log an activity
 */
export async function logActivity(data: {
  userId: string;
  action: string;
  details?: any;
  documentId?: string;
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
      document: true,
      game: true,
    },
  });
}

// Comments

/**
 * Get comments for a document section
 */
export async function getSectionComments(sectionId: string) {
  return db.query.comments.findMany({
    where: and(
      eq(schema.comments.documentSectionId, sectionId),
      sql`${schema.comments.parentCommentId} IS NULL`
    ),
    with: {
      user: true,
      replies: {
        with: {
          user: true,
        },
      },
    },
    orderBy: [desc(schema.comments.createdAt)],
  });
}

/**
 * Create a comment
 */
export async function createComment(data: {
  documentSectionId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  position?: any;
}) {
  const [comment] = await db.insert(schema.comments).values(data).returning();
  return comment;
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, userId: string) {
  await db
    .delete(schema.comments)
    .where(
      and(eq(schema.comments.id, commentId), eq(schema.comments.userId, userId))
    );
}
