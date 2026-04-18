import { motion, useReducedMotion } from "framer-motion";
import { Check, ExternalLink, Key, Search, SquareCheckBig } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { analytics } from "@/utils/analytics";
import {
  fadeUp,
  scaleIn,
  scrollRevealProps,
  staggerContainer,
  staggerContainerWide,
} from "@/utils/motion";

/**
 * Custom event signalling that the user is heading toward the Get Started
 * section (e.g. the hero CTA). The section listens and hydrates the
 * interactive form ahead of the intersection observer firing so the input is
 * ready when the user arrives.
 */
export const PRELOAD_GET_STARTED_FORM_EVENT = "preload-get-started-form";

const GetStartedForm = lazy(() => import("./get-started-form"));

const steps = [
  {
    cta: {
      href: "https://github.com/settings/tokens/new?scopes=repo,delete_repo,read:org&description=Repo+Remover",
      label: "Generate PAT on GitHub",
    },
    description:
      "Create a GitHub PAT with the permissions needed to manage your repositories.",
    icon: Key,
    number: "1",
    title: "Generate a Personal Access Token",
  },
  {
    description:
      "Paste your PAT into Repo Remover. It stays in your browser — we never see it, log it, or send it anywhere.",
    icon: Search,
    number: "2",
    title: "Paste Your Token & Load Repos",
  },
  {
    description:
      "Search, filter, and select what should be archived, or deleted. Confirm your choices and Repo Remover handles the rest.",
    icon: SquareCheckBig,
    number: "3",
    title: "Review and Clean Up",
  },
];

/**
 * Placeholder sized to match the interactive form so the card does not resize
 * when `GetStartedForm` mounts. Heights chosen to mirror the stacked layout:
 * input + error/success line + checkbox row + submit button.
 */
function FormFallback() {
  return (
    <div className="space-y-4" data-testid="get-started-form-fallback">
      <div className="h-[46px] w-full rounded-md bg-default-100 border border-divider" />
      <div className="h-4" />
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-sm bg-default-100 border border-divider" />
        <div className="h-4 w-40 rounded bg-default-100" />
      </div>
      <div className="h-12 w-full rounded-md bg-default-200" />
    </div>
  );
}

function useDeferredFormLoad(): [
  boolean,
  React.RefObject<HTMLDivElement | null>,
] {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const load = () => setShouldLoad(true);

    // Preload signal from the hero CTA — fires immediately so the form is
    // hydrating while the smooth scroll is still in flight.
    window.addEventListener(PRELOAD_GET_STARTED_FORM_EVENT, load, {
      once: true,
    });

    // Intersection observer as the fallback trigger for users who scroll
    // organically past the section.
    let observer: IntersectionObserver | undefined;
    const node = containerRef.current;
    if (node && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              load();
              observer?.disconnect();
              break;
            }
          }
        },
        { rootMargin: "400px 0px" },
      );
      observer.observe(node);
    } else {
      // Environment without IntersectionObserver — load immediately so the
      // form is still reachable (e.g. SSR/older browsers, tests).
      load();
    }

    return () => {
      window.removeEventListener(PRELOAD_GET_STARTED_FORM_EVENT, load);
      observer?.disconnect();
    };
  }, [shouldLoad]);

  return [shouldLoad, containerRef];
}

export function GetStartedSection() {
  const reduced = useReducedMotion();
  const [shouldLoadForm, formContainerRef] = useDeferredFormLoad();

  return (
    <section className="w-full px-6 sm:px-8 py-16 sm:py-20" id="get-started">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            variants={fadeUp}
          >
            Get Started in Under 2 Minutes
          </motion.h2>
          <motion.p
            className="text-lg text-default-500 max-w-2xl mx-auto text-balance"
            variants={fadeUp}
          >
            No installs, no sign-up, no server. Just a token in your browser and
            you're ready to go.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative"
          {...scrollRevealProps(staggerContainerWide, reduced)}
        >
          {/* Connecting line — desktop only */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-divider hidden sm:block" />

          <div className="space-y-8 sm:space-y-10">
            {steps.map((step, index) => (
              <motion.div
                className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4 sm:gap-6 relative"
                key={index}
                variants={fadeUp}
              >
                <div className="shrink-0 relative z-10">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shadow-sm ring-4 ring-background ${
                      index === 0
                        ? "bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white"
                        : "bg-default-100 text-default-500 border border-divider"
                    }`}
                  >
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 sm:pt-1 sm:pb-2">
                  <h3 className="text-lg font-semibold mb-1.5">{step.title}</h3>
                  <p className="text-default-500 mb-3">{step.description}</p>
                  {step.cta && (
                    <a
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                      href={step.cta.href}
                      onClick={() => analytics.trackGeneratePATClick()}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {step.cta.label}
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* PAT form card — deferred so the home bundle omits Octokit */}
        <motion.div
          className="mt-16 max-w-xl mx-auto"
          {...scrollRevealProps(scaleIn, reduced)}
        >
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-2 text-center">
                Ready to start?
              </h3>
              <p className="text-sm text-default-500 text-center mb-6">
                Paste your PAT below to load your repositories.
              </p>

              <div ref={formContainerRef}>
                {shouldLoadForm ? (
                  <Suspense fallback={<FormFallback />}>
                    <GetStartedForm />
                  </Suspense>
                ) : (
                  <FormFallback />
                )}
              </div>

              <div className="flex justify-center mt-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-6 text-xs text-default-400">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    Stays in your browser
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    Never sent to a server
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    100% free
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
