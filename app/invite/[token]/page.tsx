"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchInvitationByToken,
  acceptInvitation,
  declineInvitation,
} from "@/lib/actions/collaboration-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check,
  X,
  Clock,
  Gamepad,
  Shield,
  Edit,
  MessageSquare,
  Eye,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/providers/user-context";

interface InvitationDetails {
  id: string;
  game_id: string | null;
  inviter_id: string;
  invitee_email: string;
  role: string;
  status: string;
  message: string | null;
  created_at: string;
  expires_at: string;
  games?: {
    id: string;
    name: string;
    image_url: string;
    concept: string;
  };
  user?: {
    name: string;
    email: string;
    image: string;
  };
}

export default function InvitePage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const { userId, user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading) {
      fetchInvitation();
    }
  }, [token, userLoading]);

  const fetchInvitation = async () => {
    try {
      const data = await fetchInvitationByToken(token);

      if (!data) {
        setError("This invitation link is invalid or has expired.");
        return;
      }

      if (data.status !== "pending") {
        setError(`This invitation has already been ${data.status}.`);
        return;
      }

      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setError("This invitation has expired.");
        return;
      }

      setInvitation(data);
    } catch (err: any) {
      console.error("Error fetching invitation:", err);
      setError("Failed to load invitation details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation) return;

    if (!userId) {
      // Store the invitation token and redirect to login
      localStorage.setItem("pending_invitation", token);
      router.push("/sign-in");
      return;
    }

    // Check if the logged-in user's email matches the invitation
    if (invitation.invitee_email && user?.email !== invitation.invitee_email) {
      toast.error("This invitation was sent to a different email address.");
      return;
    }

    setProcessing(true);
    try {
      const result = await acceptInvitation(invitation.id, userId);

      if (!result.success) {
        throw new Error(result.error || "Failed to accept invitation");
      }

      toast.success("Invitation accepted successfully!");

      // Redirect to the game page
      if (invitation.game_id) {
        router.push(`/games/${invitation.game_id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      toast.error(err.message || "Failed to accept invitation");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    setProcessing(true);
    try {
      const result = await declineInvitation(invitation.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to decline invitation");
      }

      toast.success("Invitation declined");
      router.push("/");
    } catch (err: any) {
      console.error("Error declining invitation:", err);
      toast.error("Failed to decline invitation");
    } finally {
      setProcessing(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5" />;
      case "editor":
        return <Edit className="h-5 w-5" />;
      case "reviewer":
        return <MessageSquare className="h-5 w-5" />;
      case "viewer":
        return <Eye className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access, can manage team members";
      case "editor":
        return "Can edit GDD content and scenes";
      case "reviewer":
        return "Can view and add comments";
      case "viewer":
        return "Can view only";
      default:
        return "";
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-accent mb-4">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Gamepad className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            You&apos;re invited to collaborate!
          </CardTitle>
          <CardDescription>
            {invitation.user?.name || "Someone"} has invited you to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-accent mb-1">Game</p>
              <p className="font-semibold text-lg">
                {invitation.games?.name || "Unknown Game"}
              </p>
              {invitation.games?.concept && (
                <p className="text-sm text-accent mt-1 line-clamp-2">
                  {invitation.games.concept}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-accent mb-1">Your role</p>
              <Badge className="gap-1" variant="secondary">
                {getRoleIcon(invitation.role)}
                <span className="capitalize">{invitation.role}</span>
              </Badge>
              <p className="text-xs text-accent mt-1">
                {getRoleDescription(invitation.role)}
              </p>
            </div>

            <div>
              <p className="text-sm text-accent mb-1">Invited by</p>
              <p className="font-medium">
                {invitation.user?.name || "Unknown User"}
              </p>
              <p className="text-sm text-accent">
                {invitation.user?.email}
              </p>
            </div>

            {invitation.message && (
              <div>
                <p className="text-sm text-accent mb-1">Message</p>
                <p className="text-sm italic">
                  &quot;{invitation.message}&quot;
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-accent">
              <Clock className="h-4 w-4" />
              <span>
                Expires{" "}
                {formatDistanceToNow(new Date(invitation.expires_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!userId ? (
            <div className="space-y-3">
              <Button
                onClick={() => {
                  localStorage.setItem("pending_invitation", token);
                  router.push("/sign-in");
                }}
                className="w-full"
                size="lg"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign in to Accept
              </Button>
              <Button
                onClick={() => {
                  localStorage.setItem("pending_invitation", token);
                  router.push("/sign-up");
                }}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </Button>
              <Button
                onClick={handleDeclineInvitation}
                variant="ghost"
                className="w-full"
                disabled={processing}
              >
                Decline Invitation
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={handleDeclineInvitation}
                variant="outline"
                className="flex-1"
                disabled={processing}
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button
                onClick={handleAcceptInvitation}
                className="flex-1"
                disabled={processing}
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
