"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/providers/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { InvitationsSection, Invitation } from "./invitations-section";
import { fetchPendingInvitations } from "@/lib/actions/collaboration-actions";

export default function MessagesPage() {
  const { user, userId, loading: userLoading } = useUser();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvitations = useCallback(async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const data = await fetchPendingInvitations(user.email);
      setInvitations(data);
    } catch (error) {
      console.error("Error loading invitations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!userLoading && user?.email) {
      loadInvitations();
    }
  }, [userLoading, user?.email, loadInvitations]);

  const handleInvitationHandled = () => {
    loadInvitations();
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          View your invitations and messages
        </p>
      </div>

      {/* Invitations Section */}
      <InvitationsSection
        invitations={invitations}
        userId={userId || ""}
        onInvitationHandled={handleInvitationHandled}
        isLoading={userLoading || isLoading}
      />

      {/* Messages Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col text-accent items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 mb-3" />
            <p className="">No messages yet</p>
            <p className="text-sm mt-1">
              Messages from collaborators will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
