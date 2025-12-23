"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative p-2 hover:bg-gray-100 dark:hover:bg-black/50 rounded-full transition-colors",
        className
      )}
    >
      <Sun className="h-5 w-5 text-gray-600 transition-all dark:hidden" />
      <Moon className="h-5 w-5 text-gray-600 transition-all hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
