import { motion, useInView, useReducedMotion } from "framer-motion";
import { Funnel, Search, Shield, SquareCheckBig } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  fadeUp,
  scrollRevealProps,
  staggerContainerWide,
} from "@/utils/motion";

/** Wrapper that draws SVG icon strokes when scrolled into view */
function AnimatedIcon({
  icon: Icon,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- ?? would swallow false, hiding icons for non-reduced-motion users
  const visible = prefersReduced || isInView;

  return (
    <motion.div
      ref={ref}
      initial={
        prefersReduced ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
      }
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
      className="[&_svg]:w-16 [&_svg]:h-16 sm:[&_svg]:w-20 sm:[&_svg]:h-20 md:[&_svg]:w-24 md:[&_svg]:h-24 [&_svg]:text-white"
      style={{
        strokeDasharray: visible ? "none" : "200",
        strokeDashoffset: visible ? "0" : "200",
      }}
    >
      <Icon strokeWidth={1.5} />
    </motion.div>
  );
}

const features = [
  {
    benefits: [
      "Search across all your repositories instantly",
      "Filter by name and description",
      "See results update in real-time as you type",
    ],
    description:
      "Find any repository instantly by name or description. No more scrolling through endless lists.",
    icon: Search,
    title: "Instant Search",
  },
  {
    benefits: [
      "Filter by visibility (public, private, archived)",
      "Sort by any column with a single click",
      "Combine multiple filters for precise results",
    ],
    description:
      "Show only private repos, archived projects, or forks. Sort by name or last updated. Combine filters for precise results.",
    icon: Funnel,
    title: "Advanced Filtering & Sorting",
  },
  {
    benefits: [
      "Select individual repos or use 'select all'",
      "Archive or delete multiple repos simultaneously",
      "Confirmation dialogs prevent accidents",
    ],
    description:
      "Select repos with checkboxes and act on all of them at once. Archive dozens or delete test repos in a single click.",
    icon: SquareCheckBig,
    title: "Bulk Operations Made Simple",
  },
  {
    benefits: [
      "Your token stays in your browser only",
      "No server, no backend, no personal data collected",
      "Open source code you can read and audit",
    ],
    description:
      "Your token never leaves your browser. It's used directly to call the GitHub API client-side — no backend, no server, nothing to intercept.",
    icon: Shield,
    title: "Private & Secure",
  },
];

export function FeaturesSection() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full" id="features">
      {features.map((feature, index) => (
        <div
          className={`w-full px-6 sm:px-8 py-14 sm:py-20 ${index % 2 === 1 ? "bg-default-50" : ""}`}
          key={index}
        >
          <motion.div
            className="max-w-5xl mx-auto"
            {...scrollRevealProps(staggerContainerWide, reduced)}
          >
            <div
              className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 sm:gap-12 md:gap-16`}
            >
              <motion.div
                className="flex-1 flex justify-center"
                variants={fadeUp}
              >
                <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-cyan)] dark:from-[var(--brand-blue)]/80 dark:to-[var(--brand-cyan)]/80 flex items-center justify-center shadow-xl">
                  <AnimatedIcon icon={feature.icon} />
                </div>
              </motion.div>
              <motion.div
                className="flex-1 text-center md:text-left"
                variants={fadeUp}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                  {feature.title}
                </h2>
                <p className="text-lg text-default-500 mb-6 text-balance">
                  {feature.description}
                </p>
                <ul className="space-y-3 mb-8 text-left w-fit mx-auto md:mx-0">
                  {feature.benefits.map((benefit, i) => (
                    <li className="flex items-start gap-3" key={i}>
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                {index === 0 && (
                  <div>
                    <Button
                      className="w-full sm:w-auto mt-4 gap-2 px-6 py-2.5 bg-[var(--brand-blue)] text-white hover:opacity-90"
                      onClick={() => {
                        const target = document.getElementById("get-started");
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Try It Now
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      ))}
    </section>
  );
}
