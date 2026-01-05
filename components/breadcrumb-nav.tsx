"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { capitalize } from "@/lib/utils";
import React from "react";
import { fetchGameName } from "@/lib/actions/game-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBreadcrumb } from "@/providers/breadcrumb-context";

interface BreadcrumbItemType {
  href: string;
  text: string;
  isLastItem: boolean;
}

export function BreadcrumbNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [gameNames, setGameNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  let overrides: any[] = [];
  try {
    const context = useBreadcrumb();
    overrides = context.overrides || [];
  } catch (e) {
    console.error("Error fetching breadcrumb overrides:", e);
  }

  // Pages to hide from breadcrumbs
  const hideFromBreadcrumbs = ["/dashboard"];

  // Special page name mappings
  const pageNameMappings: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/games": "Games",
    "/notes": "Notes",
    "/settings": "Settings",
    "/playground": "Playground",
    "/new-game": "New Game",
    "/all-games": "All Games",
    "/document": "Document",
    "/edit": "Edit",
  };

  // Fetch game names for better display
  useEffect(() => {
    const loadGameName = async (gameId: string) => {
      if (gameNames[gameId]) return; // Already fetched

      setLoading(true);
      try {
        const name = await fetchGameName(gameId);
        if (name) {
          setGameNames((prev) => ({ ...prev, [gameId]: name }));
        }
      } catch (error) {
        console.error("Error fetching game name:", error);
      } finally {
        setLoading(false);
      }
    };

    // Check if we have a game ID in the path
    const segments = pathname.split("/").filter(Boolean);
    const gamesIndex = segments.indexOf("games");

    if (gamesIndex !== -1 && segments[gamesIndex + 1]) {
      const potentialGameId = segments[gamesIndex + 1];
      // Check if it looks like a UUID or number (game ID)
      if (potentialGameId.match(/^[0-9a-f-]+$/i)) {
        loadGameName(potentialGameId);
      }
    }
  }, [pathname, gameNames]);

  const generateBreadcrumbs = (): BreadcrumbItemType[] => {
    if (pathname === "/" || pathname === "/dashboard") return [];

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItemType[] = [];

    segments.forEach((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;

      // Skip hidden paths
      if (hideFromBreadcrumbs.includes(href)) return;

      let text = segment;

      // Check for override first
      const override = overrides.find((o) => o.path === href);
      if (override) {
        text = override.title;
      }
      // Check if this is a game ID and we have its name
      else if (segments[index - 1] === "games" && segment.match(/^[0-9a-f-]+$/i)) {
        text = gameNames[segment] || `Game`;
      }
      // Check for special page mappings
      else if (pageNameMappings[`/${segment}`]) {
        text = pageNameMappings[`/${segment}`];
      }
      // Format the text nicely
      else {
        text = capitalize(segment.replace(/-/g, " "));
      }

      const isLastItem = index === segments.length - 1;

      breadcrumbs.push({
        href,
        text,
        isLastItem,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const maxItemsToShow = 3; // Show max 3 items before collapsing
  const shouldCollapse = breadcrumbs.length > maxItemsToShow + 1; // +1 for dashboard

  // Handle collapsed breadcrumbs
  const renderBreadcrumbs = () => {
    if (!shouldCollapse) {
      return breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          <BreadcrumbItem>
            {crumb.isLastItem ? (
              <BreadcrumbPage className="font-medium">
                {loading && crumb.text.startsWith("Game ") ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </span>
                ) : (
                  crumb.text
                )}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                onClick={() => router.push(crumb.href)}
                className="cursor-pointer hover:text-foreground transition-colors"
              >
                {crumb.text}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
        </React.Fragment>
      ));
    }

    // Show first item, ellipsis dropdown, and last 2 items
    const firstItem = breadcrumbs[0];
    const lastItems = breadcrumbs.slice(-2);
    const collapsedItems = breadcrumbs.slice(1, -2);

    return (
      <>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => router.push(firstItem.href)}
            className="cursor-pointer hover:text-foreground transition-colors"
          >
            {firstItem.text}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors">
              <BreadcrumbEllipsis className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {collapsedItems.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="cursor-pointer"
                >
                  {item.text}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {lastItems.map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              {crumb.isLastItem ? (
                <BreadcrumbPage className="font-medium">
                  {loading && crumb.text.startsWith("Game ") ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </span>
                  ) : (
                    crumb.text
                  )}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() => router.push(crumb.href)}
                  className="cursor-pointer hover:text-foreground transition-colors"
                >
                  {crumb.text}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < lastItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </>
    );
  };

  // Special handling for dashboard
  if (pathname === "/dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Don't show breadcrumbs on landing page
  if (pathname === "/") {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Always show dashboard as first item */}
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer hover:text-foreground transition-colors"
          >
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.length > 0 && (
          <>
            <BreadcrumbSeparator />
            {renderBreadcrumbs()}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
