import { motion, useReducedMotion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { fadeUp, scrollRevealProps, staggerContainer } from "@/utils/motion";

const faqs = [
  {
    answer:
      "Yes! Repo Remover is completely free and open source. There are no hidden fees, premium tiers, or paid features.",
    question: "Is Repo Remover really free?",
  },
  {
    answer:
      "Completely safe. Your token is only ever used in your browser to call the GitHub API — it's never sent to any server, logged, or stored anywhere outside your device.",
    question: "Is my data safe? Do you store my GitHub credentials?",
  },
  {
    answer:
      "Archiving is fully reversible — you can unarchive repositories anytime through GitHub. However, deletions are permanent. That's why we show a confirmation dialog with username verification before any deletion.",
    question: "Can I undo deletions or archiving?",
  },
  {
    answer:
      "Yes! Repo Remover works with both personal and organization repositories, as long as your token has the necessary permissions.",
    question: "Does this work with organization repositories?",
  },
  {
    answer:
      "There's no limit. Whether you have 10 or 1,000+ repositories, Repo Remover handles them all with search, filtering, and pagination.",
    question: "How many repositories can I manage at once?",
  },
  {
    answer:
      "No. Repo Remover runs entirely in your browser. Just visit the site, paste your GitHub Personal Access Token, and start cleaning up.",
    question: "Do I need to install anything?",
  },
];

export function FAQSection() {
  const reduced = useReducedMotion();

  return (
    <section className="w-full px-6 sm:px-8 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          {...scrollRevealProps(staggerContainer, reduced)}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            variants={fadeUp}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p className="text-lg text-default-500" variants={fadeUp}>
            Everything you need to know about Repo Remover
          </motion.p>
        </motion.div>

        <motion.div {...scrollRevealProps(staggerContainer, reduced)}>
          <Accordion className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={fadeUp}>
                <AccordionItem
                  className="rounded-xl border border-divider hover:border-primary/60 bg-background px-5 transition-colors"
                  value={index}
                >
                  <AccordionTrigger className="text-left text-base text-default-700 hover:text-foreground py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-default-700 text-sm">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
