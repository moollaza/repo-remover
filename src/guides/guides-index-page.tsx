import type { GuideMeta, GuideWithContent } from "./types";
import { Badge } from "@/components/ui/badge";

function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function GuideCard({ meta }: { meta: GuideMeta }) {
  return (
    <a
      href={`/guides/${meta.slug}/`}
      className="group block p-6 rounded-xl border border-divider bg-content1 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all no-underline"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="muted" size="xs">
              Guide
            </Badge>
            {meta.date && (
              <time
                dateTime={meta.date}
                className="text-xs text-default-400 font-normal"
              >
                {formatDate(meta.date)}
              </time>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight">
            {meta.title}
          </h2>
          <p className="text-default-500 leading-relaxed m-0">
            {meta.description}
          </p>
          <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            Read guide
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

export function GuidesIndexPage({ guides }: { guides: GuideWithContent[] }) {
  const sorted = [...guides].sort((a, b) =>
    (b.meta.date || "").localeCompare(a.meta.date || ""),
  );

  return (
    <div className="mt-2">
      <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
        GitHub Repository Management Guides
      </h1>
      <p className="text-lg text-default-500 mb-10 leading-relaxed">
        Practical guides on managing, archiving, and deleting GitHub
        repositories at scale.
      </p>
      <div className="grid grid-cols-1 gap-4">
        {sorted.map(({ meta }) => (
          <GuideCard key={meta.slug} meta={meta} />
        ))}
      </div>
    </div>
  );
}
