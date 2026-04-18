import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";

import {
  fadeUp,
  scaleIn,
  scrollRevealProps,
  staggerContainer,
} from "@/utils/motion";

export function ProductShowcase() {
  const reduced = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <section
      className="w-full px-6 sm:px-8 py-16 sm:py-20 bg-gradient-to-b from-background to-default-50"
      id="how-it-works"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          <motion.span
            className="inline-block px-3 py-1 text-xs rounded-full bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] border border-[var(--brand-blue)]/20 mb-4"
            variants={fadeUp}
          >
            See it in action
          </motion.span>
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            variants={fadeUp}
          >
            All Your Repos in One View
          </motion.h2>
          <motion.p
            className="text-lg text-default-500 max-w-2xl mx-auto"
            variants={fadeUp}
          >
            Browse your repositories in an organized table. Search, filter,
            select, and take action.
          </motion.p>
        </motion.div>

        {/* Glow + UI mockup */}
        <motion.div
          className="relative"
          {...scrollRevealProps(scaleIn, reduced)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] blur-3xl opacity-10 dark:opacity-20 rounded-3xl" />
          {/* Desktop screenshot — 1280x732 (≈16:9.15). Fixed aspect ratio prevents CLS
              whether or not the theme resolves before the image loads. */}
          <div
            className="relative w-full hidden sm:block"
            style={{ aspectRatio: "1280 / 732" }}
          >
            <img
              alt="Repo Remover dashboard showing repository management with search, filters, and bulk actions"
              className="absolute inset-0 h-full w-full rounded-xl border border-divider shadow-2xl"
              decoding="async"
              height={732}
              loading="lazy"
              src={
                isDark
                  ? "/images/dashboard-dark.png"
                  : "/images/dashboard-light.png"
              }
              width={1280}
            />
          </div>
          {/* Mobile screenshot — 390x844 (tall). */}
          <div
            className="relative w-full sm:hidden"
            style={{ aspectRatio: "390 / 844" }}
          >
            <img
              alt="Repo Remover dashboard on mobile showing repository list with badges and actions"
              className="absolute inset-0 h-full w-full rounded-xl border border-divider shadow-2xl"
              decoding="async"
              height={844}
              loading="lazy"
              src={
                isDark
                  ? "/images/dashboard-mobile-dark.png"
                  : "/images/dashboard-mobile-light.png"
              }
              width={390}
            />
          </div>
        </motion.div>

        {/* Feature highlights below */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          <motion.div className="text-center" variants={fadeUp}>
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Instant Search</h3>
            <p className="text-sm text-default-500">
              Find repos by name or description in milliseconds
            </p>
          </motion.div>
          <motion.div className="text-center" variants={fadeUp}>
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Smart Filtering</h3>
            <p className="text-sm text-default-500">
              Filter by type, visibility, and more
            </p>
          </motion.div>
          <motion.div className="text-center" variants={fadeUp}>
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold mb-1">Bulk Actions</h3>
            <p className="text-sm text-default-500">
              Select multiple repos and act on them at once
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
