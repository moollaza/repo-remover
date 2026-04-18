import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GuidesIndexPage } from "./guides-index-page";
import type { GuideWithContent } from "./types";

const guides: GuideWithContent[] = [
  {
    meta: {
      title: "Older Guide",
      description: "Older description.",
      slug: "older",
      canonical: "https://reporemover.xyz/guides/older/",
      date: "2026-01-01",
    },
    html: "",
  },
  {
    meta: {
      title: "Newer Guide",
      description: "Newer description.",
      slug: "newer",
      canonical: "https://reporemover.xyz/guides/newer/",
      date: "2026-04-12",
    },
    html: "",
  },
];

describe("GuidesIndexPage", () => {
  const html = renderToStaticMarkup(<GuidesIndexPage guides={guides} />);

  test("renders the hero heading and lede", () => {
    expect(html).toContain("GitHub Repository Management Guides");
    expect(html).toContain(
      "Practical guides on managing, archiving, and deleting GitHub repositories at scale.",
    );
  });

  test("emits one card anchor per guide", () => {
    const cards = Array.from(html.matchAll(/href="\/guides\/[^/]+\/"/g));
    expect(cards).toHaveLength(guides.length);
  });

  test("sorts guides newest first", () => {
    const newerIdx = html.indexOf("Newer Guide");
    const olderIdx = html.indexOf("Older Guide");
    expect(newerIdx).toBeGreaterThan(-1);
    expect(olderIdx).toBeGreaterThan(-1);
    expect(newerIdx).toBeLessThan(olderIdx);
  });

  test("renders a Badge labelled Guide on each card", () => {
    const badges = Array.from(html.matchAll(/>Guide</g));
    expect(badges.length).toBeGreaterThanOrEqual(guides.length);
  });

  test("renders a formatted human-readable date per guide", () => {
    expect(html).toContain("April 12, 2026");
    expect(html).toContain("January 1, 2026");
  });

  test("renders a Read guide affordance per card", () => {
    const affordances = Array.from(html.matchAll(/Read guide/g));
    expect(affordances).toHaveLength(guides.length);
  });
});
