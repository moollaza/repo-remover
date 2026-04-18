import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

import { GithubIcon } from "@/components/icons";

import { PRELOAD_GET_STARTED_FORM_EVENT } from "@/components/landing/get-started-section";
import { analytics } from "@/utils/analytics";
import { fadeUp, staggerContainer } from "@/utils/motion";

export function HeroSection() {
  return (
    <section className="w-full px-6 sm:px-8 py-16 md:py-28">
      <motion.div
        animate="visible"
        className="max-w-5xl mx-auto text-center"
        initial="hidden"
        variants={staggerContainer}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-default-100 border border-divider mb-8"
          variants={fadeUp}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand-blue)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand-blue)]" />
          </span>
          <span className="text-sm text-default-500">
            250,000+ repos cleaned&nbsp;up!
          </span>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight"
          variants={fadeUp}
        >
          The bulk cleanup tool
          <br />
          <span className="bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-cyan)] bg-clip-text text-transparent">
            GitHub should have&nbsp;built.
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-default-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          variants={fadeUp}
        >
          25,000+ developers stopped deleting repos one by one. Review, archive,
          or delete in bulk from one screen — free, open source, and secure.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          variants={fadeUp}
        >
          <motion.button
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 sm:py-3.5 rounded-lg bg-[var(--brand-blue)] text-white font-medium text-sm sm:text-base hover:opacity-90 transition-opacity shadow-sm"
            onClick={() => {
              analytics.trackHeroCTAClick();
              window.dispatchEvent(new Event(PRELOAD_GET_STARTED_FORM_EVENT));
              const target = document.getElementById("get-started");
              target?.scrollIntoView({ behavior: "smooth" });
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Cleaning Up
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <motion.a
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 sm:py-3.5 rounded-lg border border-divider text-foreground font-medium text-sm sm:text-base hover:bg-default-100 transition-colors"
            href="https://github.com/moollaza/repo-remover"
            rel="noopener noreferrer"
            target="_blank"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <GithubIcon className="h-5 w-5" />
            View on GitHub
          </motion.a>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-x-4 text-xs sm:text-sm text-default-600"
          variants={fadeUp}
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[var(--brand-blue)] sm:hidden" />
            Free forever
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-default-300" />
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[var(--brand-blue)] sm:hidden" />
            100% in-browser
          </span>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-default-300" />
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[var(--brand-blue)] sm:hidden" />
            Token never leaves your device
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
