"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GDD_SECTIONS,
  getSectionNavigation,
  getSection,
} from "@/lib/gdd/sections";
import {
  saveGDDSection,
  getAllGDDSections,
  getGDDSectionComments,
  GDDSectionContent,
  type GDDComment,
} from "@/lib/actions/gdd-actions";
import type { AllSectionsContent } from "@/lib/ai/prompts";
import { getUserPreferences } from "@/lib/actions/preferences-actions";
import { fetchGamePageData } from "@/lib/actions/game-actions";
import { useUser } from "@/providers/user-context";
import { SubSectionEditor } from "@/components/gdd/sub-section-editor";
import { EnhanceButtons } from "@/components/gdd/enhance-buttons";
import { ModelSelector } from "@/components/gdd/model-selector";
import {
  SuggestedMechanics,
  type MechanicData,
} from "@/components/gdd/suggested-mechanics";
import { ArrowLeft, ArrowRight, Save, Loader2, Check } from "lucide-react";
import type { AIModelId } from "@/database/drizzle/schema/preferences";

interface GameContext {
  name: string;
  concept: string;
  timeline?: string;
  genre?: string;
}

type UserRole = "owner" | "admin" | "editor" | "reviewer" | "viewer";

export default function GDDSectionPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const gameId = params.id as string;
  const sectionSlug = params.section as string;

  const section = getSection(sectionSlug);
  const navigation = getSectionNavigation(sectionSlug);

  const [gameContext, setGameContext] = useState<GameContext | null>(null);
  const [content, setContent] = useState<GDDSectionContent>({});
  const [allSectionsContent, setAllSectionsContent] =
    useState<AllSectionsContent>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState<AIModelId>("claude-sonnet");
  const [comments, setComments] = useState<Record<string, GDDComment[]>>({});
  const [userRole, setUserRole] = useState<UserRole>("viewer");
  const [mechanicsData, setMechanicsData] = useState<MechanicData[]>([]);

  const contentRef = useRef<GDDSectionContent>({});
  const allSectionsRef = useRef<AllSectionsContent>({});

  // Check if user can edit content (owner, admin, editor can edit; reviewer, viewer cannot)
  const canEdit = ["owner", "admin", "editor"].includes(userRole);
  // Check if user can comment (everyone except viewer can comment)
  const canComment = ["owner", "admin", "editor", "reviewer"].includes(userRole);

  useEffect(() => {
    if (!userLoading && userId && section) {
      loadData();
    }
  }, [gameId, sectionSlug, userId, userLoading, section]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gameResult, allSectionsResult, prefsResult, commentsResult] =
        await Promise.all([
          fetchGamePageData(gameId, userId!),
          getAllGDDSections(gameId),
          getUserPreferences(userId!),
          getGDDSectionComments(gameId, sectionSlug),
        ]);

      if (gameResult.game) {
        setGameContext({
          name: gameResult.game.name,
          concept: gameResult.game.concept || "",
          timeline: gameResult.game.timeline,
          genre: gameResult.game.genre,
        });
        // Set user role from game data
        setUserRole((gameResult.game.userRole as UserRole) || "viewer");
      }

      if (allSectionsResult.success && allSectionsResult.sections) {
        // Set all sections content for AI context
        setAllSectionsContent(allSectionsResult.sections);
        allSectionsRef.current = allSectionsResult.sections;

        // Set current section content
        const currentSectionContent =
          allSectionsResult.sections[sectionSlug] || {};
        setContent(currentSectionContent);
        contentRef.current = currentSectionContent;
      }

      if (prefsResult.success && prefsResult.preferences) {
        setSelectedModel(prefsResult.preferences.preferredAiModel);
      }

      if (commentsResult.success && commentsResult.comments) {
        setComments(commentsResult.comments);
      }
    } catch (error) {
      console.error("Error loading section data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubSectionChange = useCallback(
    (subSectionId: string, value: string) => {
      // Update current section content
      setContent((prev) => {
        const updated = { ...prev, [subSectionId]: value };
        contentRef.current = updated;
        return updated;
      });

      // Also update allSectionsContent to keep it in sync for AI context
      setAllSectionsContent((prev) => {
        const updated = {
          ...prev,
          [sectionSlug]: {
            ...prev[sectionSlug],
            [subSectionId]: value,
          },
        };
        allSectionsRef.current = updated;
        return updated;
      });

      setHasUnsavedChanges(true);
    },
    [sectionSlug],
  );

  const handleSave = useCallback(async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const result = await saveGDDSection(
        gameId,
        sectionSlug,
        contentRef.current,
        userId,
      );

      if (result.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Error saving section:", error);
    } finally {
      setIsSaving(false);
    }
  }, [gameId, sectionSlug, userId]);

  // Auto-save on interval when there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, handleSave]);

  // Get all content for enhance buttons
  const getAllContent = useCallback(() => {
    if (!section) return "";
    const staticContent = section.subSections
      .map((sub) => contentRef.current[sub.id] || "")
      .filter(Boolean);

    // Include dynamic mechanic subsections for gameplay-mechanics
    const mechanicContent =
      sectionSlug === "gameplay-mechanics"
        ? mechanicsData
            .map((m) => {
              const mechanicId = `mechanic_${m.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;
              return contentRef.current[mechanicId] || "";
            })
            .filter(Boolean)
        : [];

    return [...staticContent, ...mechanicContent].join("\n\n");
  }, [section, sectionSlug, mechanicsData]);

  // Set all content from enhance buttons
  const setAllContent = useCallback(
    (enhancedContent: string) => {
      if (!section) return;

      // Split enhanced content back into sub-sections
      // This is a simple approach - the AI should maintain paragraph structure
      const paragraphs = enhancedContent.split(/\n\n+/);
      const newContent: GDDSectionContent = {};

      section.subSections.forEach((sub, index) => {
        if (paragraphs[index]) {
          newContent[sub.id] = `<p>${paragraphs[index]}</p>`;
        } else {
          newContent[sub.id] = contentRef.current[sub.id] || "";
        }
      });

      setContent(newContent);
      contentRef.current = newContent;
      setHasUnsavedChanges(true);
    },
    [section],
  );

  // Build current section subsections for export
  const currentSectionSubSections = useMemo(() => {
    if (!section) return [];
    const staticSubSections = section.subSections.map((sub) => ({
      title: sub.title,
      content: contentRef.current[sub.id] || "",
    }));

    // Include dynamic mechanic subsections for gameplay-mechanics
    const mechanicSubSections =
      sectionSlug === "gameplay-mechanics"
        ? mechanicsData.map((m) => {
            const mechanicId = `mechanic_${m.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;
            return {
              title: m.name,
              content: contentRef.current[mechanicId] || "",
            };
          })
        : [];

    return [...staticSubSections, ...mechanicSubSections];
  }, [section, content, sectionSlug, mechanicsData]);

  // Build available sections for export (excluding current section)
  const availableSectionsForExport = useMemo(() => {
    return GDD_SECTIONS
      .filter((s) => s.slug !== sectionSlug)
      .map((s) => {
        const sectionContent = allSectionsRef.current[s.slug] || {};
        return {
          title: s.title,
          sectionType: s.slug,
          subSections: s.subSections.map((sub) => ({
            title: sub.title,
            content: sectionContent[sub.id] || "",
          })),
        };
      });
  }, [sectionSlug, allSectionsContent]);

  // Redirect to sign-in if no user after loading completes
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  if (!section) {
    notFound();
  }

  if (loading || userLoading || !userId || !gameContext) {
    return <SectionSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/games/${gameId}/document`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            All Sections
          </Button>
          <div className="text-sm text-accent">
            Section {section.number} of {GDD_SECTIONS.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <ModelSelector userId={userId!} onModelChange={setSelectedModel} />
              <EnhanceButtons
                sectionType={sectionSlug}
                sectionTitle={section.title}
                gameContext={gameContext}
                getAllContent={getAllContent}
                setAllContent={setAllContent}
                modelId={selectedModel}
                currentSectionSubSections={currentSectionSubSections}
                availableSections={availableSectionsForExport}
              />
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {String(section.number).padStart(2, "0")}. {section.title}
              </CardTitle>
            </div>
            {lastSaved && (
              <div className="text-xs text-accent">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
          <CardDescription className="mt-2 max-w-2xl">
            {section.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {sectionSlug === "gameplay-mechanics" && gameContext.genre && userId && (
            <SuggestedMechanics
              genre={gameContext.genre}
              gameId={gameId}
              userId={userId}
              onMechanicsDataChange={setMechanicsData}
            />
          )}
          {section.subSections.map((subSection) => (
            <SubSectionEditor
              key={subSection.id}
              title={subSection.title}
              placeholder={subSection.placeholder}
              subSectionType={subSection.id}
              sectionType={sectionSlug}
              gameContext={gameContext}
              allContent={allSectionsContent}
              initialContent={content[subSection.id] || ""}
              onChange={(value) => handleSubSectionChange(subSection.id, value)}
              onAcceptGenerated={handleSave}
              modelId={selectedModel}
              gameId={gameId}
              userId={userId}
              initialComments={comments[subSection.id] || []}
              onCommentsChange={(newComments) => {
                setComments((prev) => ({
                  ...prev,
                  [subSection.id]: newComments,
                }));
              }}
              canEdit={canEdit}
              canComment={canComment}
            />
          ))}
          {/* Dynamic mechanic subsections for gameplay-mechanics section */}
          {sectionSlug === "gameplay-mechanics" &&
            mechanicsData.map((mechanic) => {
              // Create a normalized ID for storage (lowercase, spaces to underscores)
              const mechanicId = `mechanic_${mechanic.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}`;
              return (
                <SubSectionEditor
                  key={mechanicId}
                  title={mechanic.name}
                  placeholder={mechanic.description || `Describe how ${mechanic.name} works in your game...`}
                  subSectionType={mechanicId}
                  sectionType={sectionSlug}
                  gameContext={gameContext}
                  allContent={allSectionsContent}
                  initialContent={content[mechanicId] || ""}
                  onChange={(value) => handleSubSectionChange(mechanicId, value)}
                  onAcceptGenerated={handleSave}
                  modelId={selectedModel}
                  gameId={gameId}
                  userId={userId}
                  initialComments={comments[mechanicId] || []}
                  onCommentsChange={(newComments) => {
                    setComments((prev) => ({
                      ...prev,
                      [mechanicId]: newComments,
                    }));
                  }}
                  canEdit={canEdit}
                  canComment={canComment}
                />
              );
            })}
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        {navigation.prev ? (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/games/${gameId}/document/${navigation.prev!.slug}`)
            }
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {navigation.prev.title}
          </Button>
        ) : (
          <div />
        )}

        {navigation.next ? (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/games/${gameId}/document/${navigation.next!.slug}`)
            }
            className="gap-2"
          >
            {navigation.next.title}
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => router.push(`/games/${gameId}`)}
            className="gap-2"
          >
            Finish GDD
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      <Skeleton className="h-[600px] w-full" />

      <div className="flex items-center justify-between pt-4 border-t">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
