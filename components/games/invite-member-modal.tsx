"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  ChevronDown,
  Loader2,
  Mail,
  Shield,
  Edit,
  MessageSquare,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { inviteToGame } from "@/lib/actions/collaboration-actions";
import { toast } from "sonner";
import type { GameRole } from "@/database/drizzle/schema/collaboration";

interface InviteMemberModalProps {
  gameId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RoleOption {
  id: GameRole;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access, can manage team members",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "editor",
    name: "Editor",
    description: "Can edit GDD content and scenes",
    icon: <Edit className="h-4 w-4" />,
  },
  {
    id: "reviewer",
    name: "Reviewer",
    description: "Can view and add comments",
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Can view only",
    icon: <Eye className="h-4 w-4" />,
  },
];

export function InviteMemberModal({
  gameId,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<GameRole>("editor");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);
    try {
      const result = await inviteToGame(
        gameId,
        userId,
        email.trim(),
        selectedRole,
      );

      if (!result.success) {
        toast.error(result.error || "Failed to send invitation");
        return;
      }

      setEmail("");
      setSelectedRole("editor");
      onSuccess();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setSelectedRole("editor");
    onClose();
  };

  const currentRole = ROLE_OPTIONS.find((r) => r.id === selectedRole);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on this game
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={sending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={sending}
                >
                  <div className="flex items-center gap-2">
                    {currentRole?.icon}
                    <span>{currentRole?.name || "Select role"}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <DropdownMenuLabel>Choose Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ROLE_OPTIONS.map((role) => (
                  <DropdownMenuItem
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "flex items-center justify-between cursor-pointer py-2",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-accent">{role.icon}</div>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </div>
                    {selectedRole === role.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sending || !email.trim()}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
