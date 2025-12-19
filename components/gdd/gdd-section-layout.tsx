"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";

interface GDDSectionLayoutProps {
  gameId: string;
  title: string;
  description: string;
  sectionNumber: number;
  totalSections: number;
  prevSection?: { slug: string; title: string };
  nextSection?: { slug: string; title: string };
  actions?: ReactNode;
  children: ReactNode;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function GDDSectionLayout({
  gameId,
  title,
  description,
  sectionNumber,
  totalSections,
  prevSection,
  nextSection,
  actions,
  children,
  onSave,
  isSaving,
  lastSaved,
}: GDDSectionLayoutProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/games/${gameId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Game
          </Button>
          <div className="text-sm text-accent">
            Section {sectionNumber} of {totalSections}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {String(sectionNumber).padStart(2, "0")}. {title}
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl">
                {description}
              </CardDescription>
            </div>
            {lastSaved && (
              <div className="text-xs text-accent">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">{children}</CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        {prevSection ? (
          <Button
            variant="outline"
            onClick={() => router.push(`/games/${gameId}/gdd/${prevSection.slug}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {prevSection.title}
          </Button>
        ) : (
          <div />
        )}

        {nextSection ? (
          <Button
            variant="outline"
            onClick={() => router.push(`/games/${gameId}/gdd/${nextSection.slug}`)}
            className="gap-2"
          >
            {nextSection.title}
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
