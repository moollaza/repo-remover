import type { GuideMeta } from "./types";
import { ProseArticle } from "./prose-article";

export function GuidePage({ meta }: { meta: GuideMeta }) {
  return (
    <>
      <ProseArticle title={meta.title} />

      <div className="mt-12 p-8 rounded-2xl bg-content1 border border-divider text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Ready to clean up your GitHub?
        </h2>
        <p className="text-default-500 mb-6">
          Repo Remover lets you bulk delete and archive repositories in seconds.
          Free, open source, and your token never leaves your browser.
        </p>
        <a
          href="/#get-started"
          className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Get Started Free
        </a>
      </div>
    </>
  );
}
