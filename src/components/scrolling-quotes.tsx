import clsx from "clsx";
import { useEffect, useState } from "react";

import styles from "./scrolling-quotes.module.css";

interface Quote {
  author: string;
  source: string;
  sourceName: string;
  text: string;
}

const quotes: Quote[] = [
  {
    author: "CodeNinja42",
    source: "https://twitter.com/CodeNinja42",
    sourceName: "Twitter",
    text: "Cleaning up old repos is like digital spring cleaning for devs.",
  },
  {
    author: "DevOpsGuru",
    source: "https://github.com/DevOpsGuru",
    sourceName: "GitHub",
    text: "Repo Remover saved me hours of manual work. Highly recommended!",
  },
  {
    author: "GitMaster",
    source: "https://linkedin.com/in/GitMaster",
    sourceName: "LinkedIn",
    text: "Finally, a tool that understands the struggle of repo management.",
  },
  {
    author: "CleanCodeAdvocate",
    source: "https://dev.to/CleanCodeAdvocate",
    sourceName: "Dev.to",
    text: "Decluttering my GitHub has never been easier. Thanks, Repo Remover!",
  },
];

export function ScrollingQuotes() {
  const [shuffledQuotes, setShuffledQuotes] = useState<Quote[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const shuffled = [...quotes].sort(() => Math.random() - 0.5);
    setShuffledQuotes(shuffled);
  }, []);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setReduceMotion(prefersReducedMotion);
  }, []);

  return (
    <div
      aria-label="Scrolling quotes"
      className={clsx("w-full", reduceMotion && "no-animations")}
      onMouseEnter={() => !reduceMotion && setIsPaused(true)}
      onMouseLeave={() => !reduceMotion && setIsPaused(false)}
    >
      <div
        className={clsx(
          "flex gap-6",
          styles.scrolling,
          isPaused && styles.paused,
        )}
        style={{
          width: `${shuffledQuotes.length * 320 * 2}px`,
        }}
      >
        {[...shuffledQuotes, ...shuffledQuotes].map((quote, index) => (
          <a
            className={clsx(
              "w-72 flex-shrink-0 cursor-pointer",
              !reduceMotion &&
                "transition-transform duration-300 ease-in-out hover:scale-105",
            )}
            href={quote.source}
            key={index}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="h-full rounded-lg bg-success-50 text-success-900 shadow-md flex flex-col">
              <div className="relative p-3 flex-grow">
                <div className="absolute top-2 left-2 text-8xl text-success opacity-10 font-serif">
                  &ldquo;
                </div>
                <blockquote className="m-0 flex flex-col">
                  <p className="text-foreground pt-6 ml-4 px-2 italic flex-grow">
                    {quote.text}
                  </p>
                  <footer className="mt-4 text-sm text-foreground-500">
                    — <cite>{quote.author}</cite>
                  </footer>
                </blockquote>
              </div>
              <div className="flex justify-between items-center px-3 py-2 border-t border-success-200">
                <span className="text-xs text-success-700 opacity-50">
                  {quote.sourceName}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
