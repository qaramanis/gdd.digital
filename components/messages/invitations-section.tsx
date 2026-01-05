"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Mail,
  Gamepad2,
  Check,
  X,
  Shield,
  Edit,
  MessageSquare,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeclineInvitationModal } from "./decline-invitation-modal";
import {
  acceptInvitation,
  declineInvitation,
} from "@/lib/actions/collaboration-actions";

export interface Invitation {
  id: string;
  gameId: string | null;
  gameName: string;
  gameImage: string | null;
  inviterName: string;
  inviterEmail: string;
  inviterImage: string | null;
  role: string;
  message: string | null;
  createdAt: string;
  expiresAt: string;
}

interface InvitationsSectionProps {
  invitations: Invitation[];
  userId: string;
  onInvitationHandled: () => void;
  isLoading?: boolean;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="h-3 w-3" />;
    case "editor":
      return <Edit className="h-3 w-3" />;
    case "reviewer":
      return <MessageSquare className="h-3 w-3" />;
    case "viewer":
      return <Eye className="h-3 w-3" />;
    default:
      return null;
  }
};

export function InvitationsSection({
  invitations,
  userId,
  onInvitationHandled,
  isLoading,
}: InvitationsSectionProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] =
    useState<Invitation | null>(null);

  const handleAccept = async (invitation: Invitation) => {
    setProcessingId(invitation.id);
    try {
      const result = await acceptInvitation(invitation.id, userId);
      if (!result.success) {
        throw new Error(result.error || "Failed to accept invitation");
      }
      toast.success("Accepted Game Invitation");
      onInvitationHandled();
      if (invitation.gameId) {
        router.push(`/games/${invitation.gameId}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineClick = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setDeclineModalOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedInvitation) return;

    setProcessingId(selectedInvitation.id);
    try {
      const result = await declineInvitation(selectedInvitation.id);
      if (!result.success) {
        throw new Error(result.error || "Failed to decline invitation");
      }
      toast.success("Invitation declined");
      onInvitationHandled();
    } catch (error: any) {
      toast.error(error.message || "Failed to decline invitation");
    } finally {
      setProcessingId(null);
      setDeclineModalOpen(false);
      setSelectedInvitation(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg border"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 -mt-1" />
            Invitations ({invitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="flex flex-col text-accent items-center justify-center py-8 text-center">
              <Mail className="h-12 w-12 mb-3" />
              <p className="">No invites available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={invitation.inviterImage || undefined} />
                    <AvatarFallback>
                      {invitation.inviterName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {invitation.inviterName} invited you to &quot;
                      {invitation.gameName}&quot;
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="gap-1 text-xs">
                        {getRoleIcon(invitation.role)}
                        <span className="capitalize">{invitation.role}</span>
                      </Badge>
                      <span className="text-xs text-foreground">
                        {formatDistanceToNow(new Date(invitation.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeclineClick(invitation)}
                      disabled={processingId === invitation.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(invitation)}
                      disabled={processingId === invitation.id}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeclineInvitationModal
        isOpen={declineModalOpen}
        onClose={() => {
          setDeclineModalOpen(false);
          setSelectedInvitation(null);
        }}
        onConfirm={handleDeclineConfirm}
        isLoading={processingId === selectedInvitation?.id}
      />
    </>
  );
}
