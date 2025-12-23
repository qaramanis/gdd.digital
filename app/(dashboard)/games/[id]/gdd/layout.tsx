"use client";

import { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GDD_SECTIONS } from "@/lib/gdd/sections";
import { ChevronRight, FileText } from "lucide-react";

interface GDDLayoutProps {
  children: ReactNode;
}

export default function GDDLayout({ children }: GDDLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const gameId = params.id as string;

  const currentSection = GDD_SECTIONS.find((s) =>
    pathname.includes(`/gdd/${s.slug}`),
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r p-4 hidden lg:block">
        <div className="space-y-1 sticky top-4">
          <div className="flex items-center gap-2 px-2">
            {/*<FileText className="h-5 w-5" />*/}
            <span className="font-semibold">Sections</span>
          </div>
          <nav className="space-y-1">
            {GDD_SECTIONS.map((section) => {
              const isActive = pathname.includes(`/gdd/${section.slug}`);
              return (
                <Link
                  key={section.slug}
                  href={`/games/${gameId}/gdd/${section.slug}`}
                  className={cn(
                    "flex items-center gap-4 px-2 py-2 text-sm rounded-lg transition-all duration-300",
                    isActive
                      ? "bg-foreground text-primary-foreground"
                      : "hover:bg-gray-200",
                  )}
                >
                  <span className="w-6 text-xs">
                    {String(section.number).padStart(2, "0")}
                  </span>
                  <span className="truncate">{section.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href={`/games/${gameId}`} className="hover:text-foreground">
            Game
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/games/${gameId}/gdd`} className="hover:text-foreground">
            GDD
          </Link>
          {currentSection && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">{currentSection.title}</span>
            </>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
