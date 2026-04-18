import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { GenerateReposButton } from "@/components/generate-repos-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGitHubData } from "@/hooks/use-github-data";
import { analytics } from "@/utils/analytics";

function DashboardThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <motion.button
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="rounded-full p-2 hover:bg-default-100 transition-colors relative overflow-hidden"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
      whileTap={{ scale: 0.85, rotate: isDark ? -90 : 90 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="block"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/**
 * Dashboard-specific header — reads the user from `useGitHubData`, so it must
 * render inside `GitHubDataProvider`. Intentionally kept out of the app root
 * so marketing routes do not bundle Octokit/auth code.
 */
export function DashboardHeader() {
  const { logout, user } = useGitHubData();
  const isDevelopment = import.meta.env.DEV;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  function handleLogout() {
    analytics.trackLogout();
    logout();
    window.location.href = "/";
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, closeDropdown]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }

    if (dropdownOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen, closeDropdown]);

  return (
    <header
      className="w-full border-b border-divider bg-background/80 backdrop-blur-sm sticky top-0 z-50"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/">
            <BrandLogo />
          </a>
          {isDevelopment && <GenerateReposButton />}
        </div>

        <div className="flex items-center gap-3">
          <DashboardThemeSwitcher />

          <div className="relative" ref={dropdownRef}>
            <Button
              className="cursor-pointer transition-opacity hover:opacity-80 gap-3 h-auto px-2 py-1"
              onClick={() => setDropdownOpen((prev) => !prev)}
              variant="ghost"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatarUrl as string}
                  alt={`${user?.name ?? user?.login ?? "User"}'s avatar`}
                />
                <AvatarFallback>
                  {(user?.name ?? user?.login ?? "?").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block leading-tight">
                <div className="text-sm font-medium text-foreground">
                  {user?.name}
                </div>
                <a
                  className="text-xs text-[var(--brand-link)] hover:underline leading-none"
                  href={(user?.url as string) ?? "https://github.com"}
                  onClick={(e) => e.stopPropagation()}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {user?.login}
                </a>
              </div>
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-divider bg-content1 shadow-lg z-50">
                <div className="px-4 py-3 border-b border-divider">
                  <p className="text-sm font-semibold text-foreground">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.name}
                  </p>
                </div>
                <Button
                  className="w-full justify-start px-4 py-2 text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-t-none rounded-b-lg transition-colors"
                  onClick={() => {
                    closeDropdown();
                    handleLogout();
                  }}
                  variant="ghost"
                >
                  Log Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
