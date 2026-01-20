"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Crown,
  Settings,
  Check,
  UserMinus,
  Shield,
  Edit,
  MessageSquare,
  Eye,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  fetchGameTeamData,
  updateGameTeamMemberRole,
  removeGameTeamMember,
} from "@/lib/actions/collaboration-actions";
import { toast } from "sonner";
import { InviteMemberModal } from "./invite-member-modal";
import type { GameRole } from "@/database/drizzle/schema/collaboration";

interface GameTeamSectionProps {
  gameId: string;
  userId: string;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: string;
}

interface TeamData {
  owner: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  members: TeamMember[];
  memberCount: number;
  isOwner: boolean;
  currentUserRole: string | null;
  invitations: Invitation[];
}

const ROLE_OPTIONS: {
  id: GameRole;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    id: "admin",
    label: "Admin",
    icon: <Shield className="h-4 w-4" />,
    description: "Full access, can manage team",
  },
  {
    id: "editor",
    label: "Editor",
    icon: <Edit className="h-4 w-4" />,
    description: "Can edit content",
  },
  {
    id: "reviewer",
    label: "Reviewer",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Can view and comment",
  },
  {
    id: "viewer",
    label: "Viewer",
    icon: <Eye className="h-4 w-4" />,
    description: "View only access",
  },
];

export function GameTeamSection({ gameId, userId }: GameTeamSectionProps) {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    loadTeamData();
  }, [gameId, userId]);

  const loadTeamData = async () => {
    try {
      const result = await fetchGameTeamData(gameId, userId);
      if (result.success && result.data) {
        setTeamData(result.data);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteClick = () => {
    if (!teamData?.isOwner && teamData?.currentUserRole !== "admin") {
      toast.error("You do not have permissions to invite new members");
      return;
    }
    setIsInviteModalOpen(true);
  };

  const handleInviteSuccess = () => {
    toast.success("Invitation sent successfully");
    setIsInviteModalOpen(false);
    loadTeamData();
  };

  const handleRoleChange = async (memberUserId: string, newRole: GameRole) => {
    try {
      const result = await updateGameTeamMemberRole(
        gameId,
        userId,
        memberUserId,
        newRole,
      );
      if (result.success) {
        toast.success("Role updated successfully");
        loadTeamData();
      } else {
        toast.error(result.error || "Failed to update role");
      }
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (
    memberUserId: string,
    memberName: string,
  ) => {
    try {
      const result = await removeGameTeamMember(gameId, userId, memberUserId);
      if (result.success) {
        toast.success(`${memberName} has been removed from the team`);
        loadTeamData();
      } else {
        toast.error(result.error || "Failed to remove member");
      }
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  // Check if current user can manage team (owner or admin)
  const canManageTeam =
    teamData?.isOwner || teamData?.currentUserRole === "admin";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teamData) {
    return null;
  }

  const allMembers = [
    {
      id: teamData.owner.id,
      odUserId: teamData.owner.id, // For owner, odUserId equals id
      name: teamData.owner.name || "Unknown",
      email: teamData.owner.email,
      image: teamData.owner.image,
      role: "owner",
      isOwner: true,
    },
    ...teamData.members.map((m) => ({
      ...m,
      odUserId: m.userId,
      isOwner: false,
    })),
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
              <CardDescription>
                {teamData.memberCount}{" "}
                {teamData.memberCount === 1 ? "member" : "members"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleInviteClick}
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Team Members */}
          <div className="space-y-3">
            {allMembers.slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.image || undefined} />
                    <AvatarFallback>
                      {member.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.name}
                      {member.isOwner && (
                        <Crown className="inline-block h-3 w-3 ml-1 text-yellow-500" />
                      )}
                    </p>
                    <p className="text-xs text-accent truncate">
                      <span className="capitalize">{member.role}</span>,{" "}
                      {member.email}
                    </p>
                  </div>
                </div>
                {/* Show settings dropdown for non-owners when current user can manage team (except for self) */}
                {!member.isOwner &&
                canManageTeam &&
                member.odUserId !== userId ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Member Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                        Change Role
                      </DropdownMenuLabel>
                      {ROLE_OPTIONS.map((role) => (
                        <DropdownMenuItem
                          key={role.id}
                          onClick={() =>
                            handleRoleChange(member.odUserId, role.id)
                          }
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {role.icon}
                            <div className="flex flex-col">
                              <span className="text-sm">{role.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {role.description}
                              </span>
                            </div>
                          </div>
                          {member.role === role.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleRemoveMember(member.odUserId, member.name)
                        }
                        className="text-destructive focus:text-destructive cursor-pointer"
                      >
                        <UserMinus className="h-4 w-4 mr-2 text-destructive" />
                        Remove from team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : member.odUserId === userId ? (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-secondary text-background"
                  >
                    You
                  </Badge>
                ) : null}
              </div>
            ))}
            {allMembers.length > 5 && (
              <p className="text-xs text-accent text-center pt-2">
                +{allMembers.length - 5} more members
              </p>
            )}
          </div>

          {/* Sent Invitations */}
          {(() => {
            const pendingInvitations = teamData.invitations.filter(
              (inv) => inv.status !== "accepted"
            );
            return (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm text-accent">
              <Mail className="h-4 w-4" />
              <span>Sent Invitations ({pendingInvitations.length})</span>
            </div>
            {pendingInvitations.length === 0 ? (
              <p className="text-sm text-accent italic">
                Sent invitations will be displayed here. Note: Accepted invitations are not displayed
              </p>
            ) : (
              <>
                {pendingInvitations.slice(0, 5).map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {invitation.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {invitation.email}
                        </p>
                        <p className="text-xs text-accent truncate">
                          <span className="capitalize">{invitation.role}</span>,{" "}
                          {formatDistanceToNow(new Date(invitation.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    {/*<Badge
                      variant="secondary"
                      className={
                        invitation.status === "pending"
                          ? "text-xs bg-secondary text-background"
                          : invitation.status === "declined"
                            ? "text-xs bg-accent text-background"
                            : invitation.status === "accepted"
                              ? "text-xs bg-green-600 text-white"
                              : "text-xs bg-muted text-muted-foreground"
                      }
                    >
                      {invitation.status === "pending"
                        ? "Invited"
                        : invitation.status === "declined"
                          ? "Declined"
                          : invitation.status === "accepted"
                            ? "Accepted"
                            : "Expired"}
                    </Badge>*/}
                  </div>
                ))}
                {pendingInvitations.length > 5 && (
                  <p className="text-xs text-accent text-center pt-2">
                    +{pendingInvitations.length - 5} more invitations
                  </p>
                )}
              </>
            )}
          </div>
            );
          })()}
        </CardContent>
      </Card>

      <InviteMemberModal
        gameId={gameId}
        userId={userId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </>
  );
}
