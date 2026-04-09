import type { Variants } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

/**
 * Returns motion props for scroll-triggered reveal animations.
 * When reduced motion is preferred (including Argos VRT), content renders
 * visible immediately instead of waiting for viewport intersection.
 */
export function scrollRevealProps(
  variants: Variants,
  prefersReduced: boolean | null,
) {
  if (prefersReduced) {
    return { animate: "visible" as const, variants };
  }
  return {
    initial: "hidden" as const,
    variants,
    viewport: viewportOnce,
    whileInView: "visible" as const,
  };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export const staggerContainerWide: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

const viewportOnce = { once: true, margin: "-80px" as const };
