"use server";

import {
  getGameMembers,
  getGameMemberCount,
  hasGameAccess,
  sendGameInvitation,
  acceptGameInvitation,
  getGameRecentActivity,
  removeGameMember,
  updateGameMemberRole,
  getInvitationByToken,
  declineInvitation as declineInvitationData,
} from "@/lib/data/collaboration";
import { db, schema } from "@/database/drizzle";
import { eq, and, desc } from "drizzle-orm";
import type { GameRole } from "@/database/drizzle/schema/collaboration";

// Game Team Management Actions

export async function fetchGameTeamData(gameId: string, userId: string) {
  try {
    // Check if user has access to the game
    const access = await hasGameAccess(gameId, userId);
    if (!access.hasAccess) {
      return { success: false, error: "You don't have access to this game" };
    }

    // Get game owner info
    const game = await db.query.games.findFirst({
      where: eq(schema.games.id, gameId),
      with: {
        user: true,
      },
    });

    if (!game) {
      return { success: false, error: "Game not found" };
    }

    // Get all team members
    const members = await getGameMembers(gameId);
    const memberCount = members.length + 1; // +1 for owner

    // Get sent invitations for this game
    const allInvitations = await db.query.invitations.findMany({
      where: eq(schema.invitations.gameId, gameId),
      orderBy: [desc(schema.invitations.createdAt)],
    });

    // Get current member emails (including owner)
    const currentMemberEmails = new Set([
      game.user.email,
      ...members.map((m) => m.user?.email).filter(Boolean),
    ]);

    // Deduplicate by email - keep only the most recent invitation per invitee
    // Filter out accepted invitations for people no longer on the team
    const invitationsByEmail = new Map<string, typeof allInvitations[0]>();
    for (const inv of allInvitations) {
      // Skip accepted invitations if the person is no longer a member
      if (inv.status === "accepted" && !currentMemberEmails.has(inv.inviteeEmail)) {
        continue;
      }
      if (!invitationsByEmail.has(inv.inviteeEmail)) {
        invitationsByEmail.set(inv.inviteeEmail, inv);
      }
    }
    const invitations = Array.from(invitationsByEmail.values());

    return {
      success: true,
      data: {
        owner: {
          id: game.user.id,
          name: game.user.name,
          email: game.user.email,
          image: game.user.image,
        },
        members: members.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.user?.name || "Unknown",
          email: m.user?.email || "",
          image: m.user?.image || null,
          role: m.role,
          joinedAt: m.joinedAt?.toISOString() || "",
        })),
        memberCount,
        isOwner: access.role === "owner",
        currentUserRole: access.role,
        invitations: invitations.map((inv) => ({
          id: inv.id,
          email: inv.inviteeEmail,
          role: inv.role,
          status: inv.status,
          createdAt: inv.createdAt?.toISOString() || "",
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching game team data:", error);
    return { success: false, error: "Failed to fetch team data" };
  }
}

export async function inviteToGame(
  gameId: string,
  inviterId: string,
  inviteeEmail: string,
  role: GameRole
) {
  try {
    // Verify inviter is the owner or admin
    const access = await hasGameAccess(gameId, inviterId);
    if (access.role !== "owner" && access.role !== "admin") {
      return { success: false, error: "Only owners and admins can invite members" };
    }

    // Check if user is already a member
    const existingMember = await db.query.gameMembers.findFirst({
      where: and(
        eq(schema.gameMembers.gameId, gameId),
        eq(
          schema.gameMembers.userId,
          db
            .select({ id: schema.user.id })
            .from(schema.user)
            .where(eq(schema.user.email, inviteeEmail))
        )
      ),
    });

    if (existingMember) {
      return { success: false, error: "User is already a team member" };
    }

    // Check if invitation already exists
    const existingInvitation = await db.query.invitations.findFirst({
      where: and(
        eq(schema.invitations.gameId, gameId),
        eq(schema.invitations.inviteeEmail, inviteeEmail),
        eq(schema.invitations.status, "pending")
      ),
    });

    if (existingInvitation) {
      return { success: false, error: "An invitation has already been sent to this email" };
    }

    // Send invitation
    const token = await sendGameInvitation(gameId, inviterId, inviteeEmail, role);

    return { success: true, token };
  } catch (error) {
    console.error("Error inviting to game:", error);
    return { success: false, error: "Failed to send invitation" };
  }
}

export async function removeGameTeamMember(
  gameId: string,
  requesterId: string,
  memberUserId: string
) {
  try {
    // Verify requester is the owner or admin
    const access = await hasGameAccess(gameId, requesterId);
    if (access.role !== "owner" && access.role !== "admin") {
      return { success: false, error: "Only owners and admins can remove members" };
    }

    await removeGameMember(gameId, memberUserId);
    return { success: true };
  } catch (error) {
    console.error("Error removing team member:", error);
    return { success: false, error: "Failed to remove team member" };
  }
}

export async function updateGameTeamMemberRole(
  gameId: string,
  requesterId: string,
  memberUserId: string,
  newRole: GameRole
) {
  try {
    // Verify requester is the owner or admin
    const access = await hasGameAccess(gameId, requesterId);
    if (access.role !== "owner" && access.role !== "admin") {
      return { success: false, error: "Only owners and admins can change roles" };
    }

    const updated = await updateGameMemberRole(gameId, memberUserId, newRole);
    return { success: true, member: updated };
  } catch (error) {
    console.error("Error updating member role:", error);
    return { success: false, error: "Failed to update member role" };
  }
}

// Legacy placeholder functions (kept for backward compatibility)

export async function fetchCollaborators(documentId: string) {
  return [];
}

export async function sendDocumentInvitation(data: {
  documentId: string;
  inviterId: string;
  inviteeEmail: string;
  role: string;
  message?: string;
}) {
  console.log("Document collaboration not yet implemented:", data);
  return { success: false, error: "Document collaboration features are not yet implemented" };
}

export async function updateCollaboratorRole(collaboratorId: string, role: string) {
  return { success: false, error: "Collaboration features are not yet implemented" };
}

export async function removeCollaborator(collaboratorId: string) {
  return { success: false, error: "Collaboration features are not yet implemented" };
}

export async function fetchInvitationByToken(token: string) {
  try {
    const invitation = await getInvitationByToken(token);
    if (!invitation) return null;

    return {
      id: invitation.id,
      status: invitation.status,
      expires_at: invitation.expiresAt?.toISOString() || "",
      game_id: invitation.gameId,
      inviter_id: invitation.inviterId,
      invitee_email: invitation.inviteeEmail,
      role: invitation.role,
      message: invitation.message,
      created_at: invitation.createdAt?.toISOString() || "",
      games: invitation.game
        ? {
            id: invitation.game.id,
            name: invitation.game.name,
            image_url: invitation.game.imageUrl || "",
            concept: invitation.game.concept || "",
          }
        : undefined,
      user: invitation.inviter
        ? {
            name: invitation.inviter.name || "",
            email: invitation.inviter.email,
            image: invitation.inviter.image || "",
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return null;
  }
}

export async function acceptInvitation(invitationId: string, userId: string) {
  try {
    await acceptGameInvitation(invitationId, userId);
    return { success: true };
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: error.message || "Failed to accept invitation" };
  }
}

export async function declineInvitation(invitationId: string) {
  try {
    await declineInvitationData(invitationId);
    return { success: true };
  } catch (error) {
    console.error("Error declining invitation:", error);
    return { success: false, error: "Failed to decline invitation" };
  }
}

export async function fetchTeamsData(userId: string, userEmail?: string) {
  return {
    pendingInvitations: [],
    sentInvitations: [],
    teams: [],
    sharedDocuments: [],
    notifications: [],
    unreadCount: 0,
  };
}

export async function fetchPendingInvitations(userEmail: string) {
  try {
    const invitations = await db.query.invitations.findMany({
      where: and(
        eq(schema.invitations.inviteeEmail, userEmail),
        eq(schema.invitations.status, "pending")
      ),
      with: {
        game: true,
        inviter: true,
      },
      orderBy: [desc(schema.invitations.createdAt)],
    });

    return invitations.map((inv) => ({
      id: inv.id,
      gameId: inv.gameId,
      gameName: inv.game?.name || "Unknown Game",
      gameImage: inv.game?.imageUrl || null,
      inviterName: inv.inviter?.name || "Unknown",
      inviterEmail: inv.inviter?.email || "",
      inviterImage: inv.inviter?.image || null,
      role: inv.role,
      message: inv.message,
      createdAt: inv.createdAt?.toISOString() || "",
      expiresAt: inv.expiresAt?.toISOString() || "",
    }));
  } catch (error) {
    console.error("Error fetching pending invitations:", error);
    return [];
  }
}

export async function createTeam(userId: string, name: string, description?: string) {
  return { success: false, error: "Team features are not yet implemented" };
}

export async function acceptTeamInvitation(invitation: any, userId: string) {
  return { success: false, error: "Team features are not yet implemented" };
}

export async function declineTeamInvitation(invitationId: string) {
  return { success: false, error: "Team features are not yet implemented" };
}

export async function markNotificationRead(notificationId: string) {
  return { success: true };
}
