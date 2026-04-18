import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { GuidePage } from "./guide-page";
import { MARKDOWN_BODY_MARKER } from "./prose-article";
import type { GuideMeta } from "./types";

const meta: GuideMeta = {
  title: "Clean Up Your GitHub Profile",
  description: "desc",
  slug: "clean-up-your-github-profile",
  canonical: "https://reporemover.xyz/guides/clean-up-your-github-profile/",
  date: "2026-04-12",
};

describe("GuidePage", () => {
  const html = renderToStaticMarkup(<GuidePage meta={meta} />);

  test("renders the guide title as an h1", () => {
    expect(html).toContain("<h1>Clean Up Your GitHub Profile</h1>");
  });

  test("emits the markdown body placeholder for post-render injection", () => {
    expect(html).toContain(`<div ${MARKDOWN_BODY_MARKER}=""></div>`);
  });

  test("applies the anchor-only hover-underline fix", () => {
    expect(html).toContain("[&amp;_a:hover]:underline");
    expect(html).not.toContain("hover:prose-a:underline");
  });

  test("renders the CTA card with Get Started link", () => {
    expect(html).toContain("Ready to clean up your GitHub?");
    expect(html).toMatch(/href="\/#get-started"[^>]*>\s*Get Started Free/);
  });
});
