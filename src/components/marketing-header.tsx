import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { buttonVariants } from "@/components/ui/button";
import { useStoredPatPresence } from "@/hooks/use-stored-pat-presence";

const homeLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#get-started", label: "Get Started" },
];

function LandingThemeSwitcher() {
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

function MobileNavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <a
      className="block px-4 py-3 text-base font-medium text-default-600 hover:text-foreground hover:bg-default-100 rounded-lg transition-colors"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate();
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {label}
    </a>
  );
}

/**
 * Marketing-surface header used on `/` and `/guides/`.
 * No GitHub data provider dependency — relies on `useStoredPatPresence`
 * so the home route doesn't preload Octokit/auth code.
 */
export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasStoredPat = useStoredPatPresence();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      className="w-full border-b border-divider bg-background/80 backdrop-blur-sm sticky top-0 z-50"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between relative">
        <a href="/">
          <BrandLogo />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {homeLinks.map((link) => (
            <motion.a
              className="text-default-500 hover:text-foreground transition-colors"
              href={link.href}
              key={link.href}
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(link.href);
                target?.scrollIntoView({ behavior: "smooth" });
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.label}
            </motion.a>
          ))}
          <motion.a
            className="text-default-500 hover:text-foreground transition-colors"
            href="/guides/"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            Guides
          </motion.a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LandingThemeSwitcher />
          {hasStoredPat && (
            <a
              className={
                buttonVariants({ variant: "default", size: "sm" }) +
                " py-2 bg-[var(--brand-blue)] text-white hover:opacity-90 text-xs sm:text-sm"
              }
              href="/dashboard"
            >
              <span className="sm:hidden">Dashboard</span>
              <span className="hidden sm:inline">Go to Dashboard</span>
            </a>
          )}
          <button
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden rounded-lg p-1.5 hover:bg-default-100 transition-colors"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            type="button"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden overflow-hidden border-t border-divider bg-background"
          >
            <div className="px-4 py-3 space-y-1">
              {homeLinks.map((link) => (
                <MobileNavLink
                  href={link.href}
                  key={link.href}
                  label={link.label}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
              <a
                className="block px-3 py-2 text-sm text-default-500 hover:text-foreground transition-colors rounded-md hover:bg-default-100"
                href="/guides/"
              >
                Guides
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
