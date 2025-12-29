"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { GDD_SECTIONS } from "@/lib/gdd/sections";
import { getAllGDDSections, GDDSectionContent } from "@/lib/actions/gdd-actions";
import { fetchGamePageData } from "@/lib/actions/game-actions";
import { useUser } from "@/providers/user-context";
import { ArrowRight, CheckCircle2, Circle, FileText } from "lucide-react";

export default function GDDIndexPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, loading: userLoading } = useUser();
  const gameId = params.id as string;

  const [game, setGame] = useState<{ name: string } | null>(null);
  const [sectionData, setSectionData] = useState<Record<string, GDDSectionContent>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && userId) {
      loadData();
    }
  }, [gameId, userId, userLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gameResult, sectionsResult] = await Promise.all([
        fetchGamePageData(gameId, userId!),
        getAllGDDSections(gameId),
      ]);

      if (gameResult.game) {
        setGame({ name: gameResult.game.name });
      }
      if (sectionsResult.success && sectionsResult.sections) {
        setSectionData(sectionsResult.sections);
      }
    } catch (error) {
      console.error("Error loading GDD data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionProgress = (slug: string) => {
    const section = GDD_SECTIONS.find((s) => s.slug === slug);
    if (!section) return 0;

    const content = sectionData[slug] || {};
    const filledSubSections = section.subSections.filter(
      (sub) => content[sub.id] && content[sub.id].trim().length > 10
    ).length;

    return (filledSubSections / section.subSections.length) * 100;
  };

  const totalProgress = () => {
    const totalSubSections = GDD_SECTIONS.reduce(
      (acc, s) => acc + s.subSections.length,
      0
    );
    const filledSubSections = GDD_SECTIONS.reduce((acc, section) => {
      const content = sectionData[section.slug] || {};
      return (
        acc +
        section.subSections.filter(
          (sub) => content[sub.id] && content[sub.id].trim().length > 10
        ).length
      );
    }, 0);

    return Math.round((filledSubSections / totalSubSections) * 100);
  };

  // Redirect to sign-in if no user after loading completes
  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/sign-in");
    }
  }, [userLoading, userId, router]);

  if (loading || userLoading || !userId) {
    return <GDDIndexSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game Design Document</h1>
          <p className="text-accent mt-1">
            {game?.name || "Your game"} - Complete all 12 sections to document your game
          </p>
        </div>
        <Button onClick={() => router.push(`/games/${gameId}`)}>
          Back to Game
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={totalProgress()} className="flex-1" />
            <span className="text-sm font-medium w-12">{totalProgress()}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GDD_SECTIONS.map((section) => {
          const progress = getSectionProgress(section.slug);
          const isComplete = progress === 100;

          return (
            <Link
              key={section.slug}
              href={`/games/${gameId}/document/${section.slug}`}
            >
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-accent">
                        {String(section.number).padStart(2, "0")}
                      </span>
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : progress > 0 ? (
                        <Circle className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
                      ) : (
                        <Circle className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="flex-1 h-1" />
                    <span className="text-xs text-accent w-8">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <p className="text-xs text-foreground mt-2">
                    {section.subSections.length} sub-sections
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function GDDIndexSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <Skeleton className="h-24 w-full" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}
