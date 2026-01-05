"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  X,
  Sparkles,
  RotateCcw,
  MessageSquare,
  MessageSquareOff,
  Trash2,
  Pencil,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AI_MODELS,
  type AIModelId,
} from "@/database/drizzle/schema/preferences";
import type { AllSectionsContent } from "@/lib/ai/prompts";
import {
  createGDDComment,
  updateGDDComment,
  deleteGDDComment,
  type GDDComment,
} from "@/lib/actions/gdd-actions";
import { Textarea } from "@/components/ui/textarea";

interface GameContext {
  name: string;
  concept: string;
  timeline?: string;
}

// Helper function to format time ago
function formatTimeAgo(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

interface SubSectionEditorProps {
  title: string;
  placeholder: string;
  subSectionType: string;
  sectionType: string;
  gameContext: GameContext;
  allContent: AllSectionsContent;
  initialContent?: string;
  onChange?: (content: string) => void;
  onAcceptGenerated?: () => void;
  modelId?: AIModelId;
  // Comment-related props
  gameId: string;
  userId: string;
  initialComments: GDDComment[];
  onCommentsChange: (comments: GDDComment[]) => void;
  // Permission props
  canEdit?: boolean;
  canComment?: boolean;
}

export function SubSectionEditor({
  title,
  placeholder,
  subSectionType,
  sectionType,
  gameContext,
  allContent,
  initialContent = "",
  onChange,
  onAcceptGenerated,
  modelId,
  gameId,
  userId,
  initialComments,
  onCommentsChange,
  canEdit = true,
  canComment = true,
}: SubSectionEditorProps) {
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Comment state
  const [isCommentEditing, setIsCommentEditing] = useState(false);
  const [isViewingComment, setIsViewingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: canEdit
          ? placeholder
          : "You do not have permission to edit this content",
      }),
    ],
    content: initialContent,
    editable: canEdit,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[100px] px-3 py-2",
          !canEdit && "cursor-not-allowed opacity-70",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Handle click on read-only editor to show permission toast
  const handleEditorClick = useCallback(() => {
    if (!canEdit) {
      toast.error("You do not have permission to edit this content");
    }
  }, [canEdit]);

  const generateContent = useCallback(async () => {
    if (!editor) return;

    setGeneratedContent("");
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType,
          subSectionType,
          gameContext,
          allContent,
          modelId,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.code === "INSUFFICIENT_CONTEXT") {
          toast.error(errorData.error);
        } else {
          const modelName = modelId ? AI_MODELS[modelId]?.name : "the AI model";
          toast.error(
            `An error occurred with ${modelName}, try a different model`,
          );
        }
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      let fullContent = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        // Check for streaming error marker
        if (fullContent.includes("__GENERATION_ERROR__")) {
          const modelName = modelId ? AI_MODELS[modelId]?.name : "the AI model";
          toast.error(
            `An error occurred with ${modelName}, try a different model`,
          );
          setGeneratedContent("");
          return;
        }

        setGeneratedContent(fullContent.trim());
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Generation error:", error);
        const modelName = modelId ? AI_MODELS[modelId]?.name : "the AI model";
        toast.error(
          `An error occurred with ${modelName}, try a different model`,
        );
      }
    } finally {
      setIsGenerating(false);
    }
  }, [editor, sectionType, subSectionType, gameContext, allContent, modelId]);

  const acceptGenerated = useCallback(() => {
    if (!editor || !generatedContent) return;

    // Convert plain text paragraphs to HTML paragraphs
    const paragraphs = generatedContent
      .split(/\n\n+/) // Split by double newlines (paragraph breaks)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const htmlContent = paragraphs
      .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`) // Wrap in <p> tags, convert single newlines to <br>
      .join("");

    editor.commands.setContent(htmlContent);
    onChange?.(htmlContent);
    setGeneratedContent("");

    // Trigger autosave when AI suggestion is accepted
    onAcceptGenerated?.();
  }, [editor, generatedContent, onChange, onAcceptGenerated]);

  const dismissGenerated = useCallback(() => {
    setGeneratedContent("");
  }, []);

  // Handle Tab/Esc keys for generated content
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (generatedContent) {
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          acceptGenerated();
        } else if (e.key === "Escape") {
          e.preventDefault();
          dismissGenerated();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [generatedContent, acceptGenerated, dismissGenerated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Start adding new comment
  const startCommentEditing = useCallback(() => {
    setIsCommentEditing(true);
    setIsViewingComment(false);
    setEditingCommentId(null);
    setNewCommentContent("");
    // Focus textarea after render
    setTimeout(() => commentTextareaRef.current?.focus(), 0);
  }, []);

  // Start editing existing comment
  const startEditingExistingComment = useCallback((comment: GDDComment) => {
    setIsCommentEditing(true);
    setIsViewingComment(false);
    setEditingCommentId(comment.id);
    setNewCommentContent(comment.content);
    // Focus textarea after render
    setTimeout(() => commentTextareaRef.current?.focus(), 0);
  }, []);

  // Start viewing a comment (read-only)
  const startViewingComment = useCallback((comment: GDDComment) => {
    setIsCommentEditing(true);
    setIsViewingComment(true);
    setEditingCommentId(comment.id);
    setNewCommentContent(comment.content);
  }, []);

  // Save comment (create or update)
  const saveComment = useCallback(async () => {
    if (!newCommentContent.trim()) {
      setIsCommentEditing(false);
      setEditingCommentId(null);
      return;
    }

    setIsSavingComment(true);
    try {
      if (editingCommentId) {
        // Update existing comment
        const result = await updateGDDComment(
          editingCommentId,
          newCommentContent,
          userId,
        );

        if (result.success && result.comment) {
          onCommentsChange(
            initialComments.map((c) =>
              c.id === editingCommentId ? result.comment! : c,
            ),
          );
          setNewCommentContent("");
          setIsCommentEditing(false);
          setEditingCommentId(null);
          toast.success("Comment updated");
        } else {
          toast.error("Failed to update comment");
        }
      } else {
        // Create new comment
        const result = await createGDDComment(
          gameId,
          sectionType,
          subSectionType,
          newCommentContent,
          userId,
        );

        if (result.success && result.comment) {
          onCommentsChange([result.comment, ...initialComments]);
          setNewCommentContent("");
          setIsCommentEditing(false);
          toast.success("Comment added");
        } else {
          toast.error("Failed to add comment");
        }
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      toast.error(
        editingCommentId ? "Failed to update comment" : "Failed to add comment",
      );
    } finally {
      setIsSavingComment(false);
    }
  }, [
    gameId,
    sectionType,
    subSectionType,
    newCommentContent,
    userId,
    initialComments,
    onCommentsChange,
    editingCommentId,
  ]);

  // Discard comment / close viewing
  const discardComment = useCallback(() => {
    setNewCommentContent("");
    setIsCommentEditing(false);
    setIsViewingComment(false);
    setEditingCommentId(null);
  }, []);

  // Delete a comment
  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      setDeletingCommentId(commentId);
      try {
        const result = await deleteGDDComment(commentId, userId);

        if (result.success) {
          onCommentsChange(initialComments.filter((c) => c.id !== commentId));
          toast.success("Comment deleted");
        } else {
          toast.error("Failed to delete comment");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Failed to delete comment");
      } finally {
        setDeletingCommentId(null);
      }
    },
    [userId, initialComments, onCommentsChange],
  );

  // Handle keyboard shortcuts for comment editing
  useEffect(() => {
    if (!isCommentEditing) return;

    const handleCommentKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveComment();
      } else if (e.key === "Escape") {
        e.preventDefault();
        discardComment();
      }
    };

    document.addEventListener("keydown", handleCommentKeyDown);
    return () => document.removeEventListener("keydown", handleCommentKeyDown);
  }, [isCommentEditing, saveComment, discardComment]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-md font-medium">{title}</label>
        <div className="flex items-center">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateContent}
              disabled={isGenerating}
              className="h-7 text-xs gap-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  AI Generate
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Comments section */}
      <div className="mb-2 p-3 bg-muted rounded-lg border border-dashed">
        <div className="flex w-full justify-start gap-2 items-center text-sm text-accent">
          {initialComments.length > 0 ? (
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Comments ({initialComments.length})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MessageSquareOff className="h-4 w-4" />
              <span>No comments available</span>
            </div>
          )}
          {canComment && (
            <>
              |
              <div
                onClick={startCommentEditing}
                className="cursor-pointer hover:text-foreground transition-all duration-300"
              >
                New Comment
              </div>
            </>
          )}
        </div>

        {/* Comment form (new/edit/view) */}
        {isCommentEditing && (
          <div className="space-y-2 my-2">
            <Textarea
              ref={commentTextareaRef}
              placeholder="Add a comment..."
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              disabled={isViewingComment}
              className={cn(
                "min-h-[60px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0",
                isViewingComment && "opacity-100 cursor-default",
              )}
            />
            {isViewingComment ? (
              <p className="text-xs text-accent">
                Read Only: Press{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                  Esc
                </kbd>{" "}
                to exit
              </p>
            ) : (
              <p className="text-xs text-accent">
                Edit: Press{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                  Enter
                </kbd>{" "}
                to save or{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                  Esc
                </kbd>{" "}
                to discard
              </p>
            )}
            <div className="w-full h-[0.5] bg-accent"></div>
          </div>
        )}

        {/* Comments list */}
        {initialComments.length > 0 && (
          <div className="space-y-1 mt-2">
            {initialComments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-center justify-between group text-sm"
              >
                <div className="flex-1 min-w-0 flex items-center gap-1">
                  <span className="truncate text-foreground">
                    {comment.content}
                  </span>
                  <span className="text-accent shrink-0">
                    - {comment.authorName || "Unknown"},{" "}
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startViewingComment(comment)}
                    className="h-5 w-5 p-0"
                    title="View comment"
                  >
                    <Eye className="h-3 w-3 text-secondary" />
                  </Button>
                  {canComment && comment.authorId === userId && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditingExistingComment(comment)}
                        className="h-5 w-5 p-2"
                        title="Edit comment"
                      >
                        <Pencil className="h-3 w-3 text-orange-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="h-5 w-5 p-2"
                        title="Delete comment"
                      >
                        {deletingCommentId === comment.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3 text-destructive" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <div
          onClick={handleEditorClick}
          className={cn(
            "border rounded-lg bg-background transition-colors",
            editor?.isFocused && "ring-2 ring-ring ring-offset-2",
            !canEdit && "cursor-not-allowed",
          )}
        >
          <EditorContent editor={editor} />
        </div>

        {/* AI Generated content preview */}
        {(generatedContent || isGenerating) && (
          <div className="mt-2 p-3 bg-muted rounded-lg border border-dashed">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {isGenerating && !generatedContent ? (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <div className="text-sm text-accent whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-row items-end justify-between">
              {generatedContent && !isGenerating && (
                <p className="text-xs text-accent mt-8">
                  Press{" "}
                  <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                    Tab
                  </kbd>{" "}
                  to accept or{" "}
                  <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                    Esc
                  </kbd>{" "}
                  to dismiss
                </p>
              )}
              {generatedContent && !isGenerating && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={acceptGenerated}
                    className="h-6 w-6 p-0"
                    title="Accept (Tab)"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateContent}
                    className="h-6 w-6 p-0"
                    title="Regenerate"
                  >
                    <RotateCcw className="h-3 w-3 text-orange-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissGenerated}
                    className="h-6 w-6 p-0"
                    title="Dismiss (Esc)"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
