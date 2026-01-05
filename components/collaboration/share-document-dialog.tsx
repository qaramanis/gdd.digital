"use client";

import { useState } from "react";
import {
  fetchCollaborators,
  sendDocumentInvitation,
  updateCollaboratorRole,
  removeCollaborator,
} from "@/lib/actions/collaboration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Share2,
  Mail,
  Users,
  Edit,
  MessageSquare,
  Eye,
  X,
  Copy,
  Check,
} from "lucide-react";

interface ShareDocumentDialogProps {
  documentId: string;
  documentTitle: string;
  userId: string;
  trigger?: React.ReactNode;
}

interface Collaborator {
  id: string;
  user_id: string;
  role: string;
  added_at: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

export function ShareDocumentDialog({
  documentId,
  documentTitle,
  userId,
  trigger,
}: ShareDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("invite");

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteMessage, setInviteMessage] = useState("");

  // Collaborators state
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  // Share link state
  const [shareLink, setShareLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const loadCollaborators = async () => {
    setLoadingCollaborators(true);
    try {
      const data = await fetchCollaborators(documentId);
      setCollaborators(data as Collaborator[]);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      toast.error("Failed to load collaborators");
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await sendDocumentInvitation({
        documentId,
        inviterId: userId,
        inviteeEmail: inviteEmail,
        role: inviteRole,
        message: inviteMessage || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send invitation");
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteMessage("");
      setInviteRole("viewer");
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (
    collaboratorId: string,
    newRole: string,
  ) => {
    try {
      const result = await updateCollaboratorRole(collaboratorId, newRole);

      if (!result.success) {
        throw new Error(result.error || "Failed to update role");
      }

      toast.success("Role updated");
      await loadCollaborators();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const result = await removeCollaborator(collaboratorId);

      if (!result.success) {
        throw new Error(result.error || "Failed to remove collaborator");
      }

      toast.success("Collaborator removed");
      await loadCollaborators();
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.error("Failed to remove collaborator");
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // const getPermissionIcon = (permission: string) => {
  //   switch (permission) {
  //     case "owner":
  //       return <Crown className="h-4 w-4" />;
  //     case "editor":
  //       return <Edit className="h-4 w-4" />;
  //     case "commenter":
  //       return <MessageSquare className="h-4 w-4" />;
  //     case "viewer":
  //       return <Eye className="h-4 w-4" />;
  //     default:
  //       return null;
  //   }
  // };

  // const getPermissionDescription = (permission: string) => {
  //   switch (permission) {
  //     case "owner":
  //       return "Full access and can delete document";
  //     case "editor":
  //       return "Can edit document content";
  //     case "commenter":
  //       return "Can view and comment only";
  //     case "viewer":
  //       return "Can view only";
  //     default:
  //       return "";
  //   }
  // };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) {
          loadCollaborators();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share &quot;{documentTitle}&quot;</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this document
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invite">Invite</TabsTrigger>
            <TabsTrigger value="collaborators">
              Collaborators{" "}
              {collaborators.length > 0 && `(${collaborators.length})`}
            </TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-4">
            <div className="space-y-4 ">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="placeholder:text-[#666666] border-1 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={setInviteRole}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg bg-background/95 backdrop-blur-xl border border-foreground/10">
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <div className="">
                          <div>Viewer</div>
                          <div className="text-xs text-[#666666]">
                            Can view only
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="reviewer">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <div>
                          <div>Reviewer</div>
                          <div className="text-xs text-[#666666]">
                            Can view and comment
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        <div>
                          <div>Editor</div>
                          <div className="text-xs text-[#666666]">
                            Can edit content
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal message to the invitation"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="placeholder:text-[#666666] border-1 outline-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSendInvitation}
                disabled={loading || !inviteEmail.trim()}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4">
            {loadingCollaborators ? (
              <div className="py-8 text-center text-accent">
                Loading collaborators...
              </div>
            ) : collaborators.length === 0 ? (
              <div className="py-8 text-center text-accent">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No collaborators yet</p>
                <p className="text-sm mt-2">
                  Invite people to start collaborating
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.user?.image} />
                        <AvatarFallback>
                          {collaborator.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {collaborator.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-accent">
                          {collaborator.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={collaborator.role}
                        onValueChange={(value) =>
                          handleUpdateRole(collaborator.id, value)
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg bg-background/95 backdrop-blur-xl border border-foreground/10">
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveCollaborator(collaborator.id)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            {shareLink ? (
              <div className="space-y-4">
                <p className="text-sm text-accent">
                  Share this link with others to invite them to collaborate
                </p>
                <div className="flex gap-2">
                  <Input value={shareLink} readOnly />
                  <Button onClick={handleCopyLink} variant="outline">
                    {linkCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-accent">
                  This link will expire in 7 days
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-accent">
                <p>Send an invitation first to generate a share link</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
