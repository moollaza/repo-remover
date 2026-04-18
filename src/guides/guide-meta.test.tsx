import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SingleGuideHead, GuidesIndexHead } from "./guide-meta";
import type { GuideMeta } from "./types";

const meta: GuideMeta = {
  title: "Archive vs Delete",
  description: "Example description.",
  slug: "archive-vs-delete",
  canonical: "https://reporemover.xyz/guides/archive-vs-delete/",
  date: "2026-04-12",
};

function findJsonLd(html: string): unknown[] {
  const matches = Array.from(
    html.matchAll(/<script type="application\/ld\+json">(.+?)<\/script>/g),
  );
  return matches.map((m) => JSON.parse(m[1].replace(/\\u003c/g, "<")));
}

describe("SingleGuideHead", () => {
  const html = renderToStaticMarkup(<SingleGuideHead meta={meta} />);

  test("renders title with suffix", () => {
    expect(html).toContain("<title>Archive vs Delete | Repo Remover</title>");
  });

  test("renders canonical, description, and OG article type", () => {
    expect(html).toContain(`<link rel="canonical" href="${meta.canonical}"/>`);
    expect(html).toContain(`content="${meta.description}"`);
    expect(html).toContain('property="og:type" content="article"');
  });

  test("emits BreadcrumbList and Article JSON-LD", () => {
    const jsonLd = findJsonLd(html);
    expect(jsonLd).toHaveLength(2);
    const [breadcrumb, article] = jsonLd as Array<Record<string, unknown>>;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(article["@type"]).toBe("Article");
    expect(article.headline).toBe(meta.title);
    expect(article.datePublished).toBe(meta.date);
  });

  test("escapes angle brackets in JSON-LD payload", () => {
    const nasty: GuideMeta = { ...meta, title: "<script>alert(1)</script>" };
    const rendered = renderToStaticMarkup(<SingleGuideHead meta={nasty} />);
    expect(rendered).not.toMatch(
      /<script type="application\/ld\+json">[^<]*<script>alert/,
    );
    expect(rendered).toContain("\\u003cscript");
  });
});

describe("GuidesIndexHead", () => {
  const html = renderToStaticMarkup(<GuidesIndexHead />);

  test("renders index title and website OG type", () => {
    expect(html).toContain(
      "GitHub Repository Management Guides | Repo Remover",
    );
    expect(html).toContain('property="og:type" content="website"');
  });

  test("emits a single BreadcrumbList", () => {
    const jsonLd = findJsonLd(html);
    expect(jsonLd).toHaveLength(1);
    const [breadcrumb] = jsonLd as Array<Record<string, unknown>>;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
  });
});
