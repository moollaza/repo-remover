import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, scrollRevealProps, staggerContainer } from "@/utils/motion";

const testimonials = [
  {
    avatar: "LW",
    handle: "Lindsay W.",
    quote:
      "This saved me a lot of time when I needed to delete 100 repos. The developer helped me out by making updates when I gave some feedback. Great!",
    rating: 5,
    source: "ProductHunt Review",
    sourceUrl: "https://www.producthunt.com/products/repo-remover/reviews",
  },
  {
    avatar: "GA",
    handle: "George A.",
    quote:
      "It was dumb simple, and the UI made it easy to filter out repos I did not want to be affected.",
    rating: 5,
    source: "ProductHunt Review",
    sourceUrl: "https://www.producthunt.com/products/repo-remover/reviews",
  },
  {
    avatar: "JY",
    handle: "@jayanth0107",
    quote: "You have created a website that GitHub won't provide.",
    rating: 5,
    source: "GitHub Gist",
    sourceUrl:
      "https://gist.github.com/mrkpatchaa/63720cbf744a2bf59a3e9cfe73fc33b0",
  },
];

export function TestimonialsSection() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full px-6 sm:px-8 py-16 sm:py-20 bg-blue-50 dark:bg-blue-950/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            variants={fadeUp}
          >
            They cleaned up. You're next.
          </motion.h2>
          <motion.p
            className="text-lg text-default-500 max-w-2xl mx-auto"
            variants={fadeUp}
          >
            Real feedback from real developers.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          {testimonials.map((t, index) => (
            <motion.div key={index} variants={fadeUp}>
              <Card className="h-full flex flex-col py-0 gap-0 bg-card border border-divider shadow-sm">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        key={i}
                      />
                    ))}
                  </div>
                  <p className="text-base text-foreground mb-6 leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <Avatar size="lg">
                      <AvatarFallback className="bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-cyan)] text-white font-semibold text-sm">
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{t.handle}</div>
                      <a
                        className="text-sm text-default-500 hover:text-primary transition-colors inline-flex items-center gap-1"
                        href={t.sourceUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t.source}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
