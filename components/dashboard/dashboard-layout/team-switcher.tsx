"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface Team {
  name: string;
  logo: React.ComponentType<{ className?: string }>;
  plan: string;
}

interface TeamSwitcherProps {
  teams: Team[];
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { isMobile, state } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground cursor-pointer hover:bg-foreground/10 transition-all duration-200 ${
                isCollapsed ? "!h-8 !min-h-8 !p-0 mt-2" : ""
              }`}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4 text-foreground" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs text-accent">
                  {activeTeam.plan}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto text-accent" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg bg-background/95 backdrop-blur-xl border border-foreground/10"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-accent uppercase tracking-wider">
              Workspaces
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2 py-1 hover:bg-foreground/10 focus:bg-foreground/10 cursor-pointer transition-colors"
              >
                <div className="flex size-6 items-center justify-center ">
                  <team.logo className="size-4 shrink-0 text-foreground" />
                </div>
                <span className="flex-1 text-foreground">{team.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-foreground/10" />
            <DropdownMenuItem className="gap-2 p-2 py-1 hover:bg-foreground/10 focus:bg-foreground/10 cursor-pointer transition-colors">
              <div className="flex size-6 items-center justify-center rounded-md border border-foreground/20 bg-foreground/10">
                <Plus className="size-4 text-accent" />
              </div>
              <div className="font-medium text-accent">Create Workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
