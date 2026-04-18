/**
 * Build script: renders guide pages to static HTML from React components.
 * Runs after `vite build` so it can read the manifest for CSS paths.
 *
 * Usage: bun run scripts/build-guides.tsx
 */

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
} from "fs";
import { resolve } from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { gfmHeadingId, resetHeadings } from "marked-gfm-heading-id";
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router";

import {
  GuidesIndexDocument,
  SingleGuideDocument,
} from "../src/guides/guide-document";
import { MARKDOWN_BODY_MARKER } from "../src/guides/prose-article";
import type { GuideMeta, GuideWithContent } from "../src/guides/types";

// -- Configure marked --
marked.use(gfmHeadingId({ prefix: "" }));
marked.use({
  renderer: {
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const isExternal = href?.startsWith("http");
      const target = isExternal ? ' target="_blank"' : "";
      const rel = isExternal ? ' rel="noopener noreferrer"' : "";
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${href}"${titleAttr}${target}${rel}>${text}</a>`;
    },
  },
});

// -- Types --
interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

// -- Paths --
const ROOT = resolve(import.meta.dir, "..");
const DIST = resolve(ROOT, "dist");
const CONTENT = resolve(ROOT, "content", "guides");

// -- Helpers --
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq)
        parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority !== undefined)
        parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

// Vite emits bundled CSS at `assets/<name>-<hash>.css`. Anything else is
// either a build-system bug or a sign of filesystem tampering. Reject
// non-conforming paths so unescaped filesystem data can never reach an HTML
// attribute (CodeQL js/stored-xss defence in depth).
const SAFE_ASSET_PATH = /^assets\/[A-Za-z0-9._-]+\.css$/;

function sanitizeCssPath(candidate: string): string {
  if (!SAFE_ASSET_PATH.test(candidate)) {
    console.warn(
      `  Warning: Rejecting unexpected CSS asset path "${candidate}".`,
    );
    return "";
  }
  return candidate;
}

function getCssPath(): string {
  const manifestPath = resolve(DIST, ".vite", "manifest.json");
  if (!existsSync(manifestPath)) {
    console.warn("  Warning: Vite manifest not found, falling back to glob");
    const files = readdirSync(resolve(DIST, "assets")).filter((f) =>
      f.endsWith(".css"),
    );
    return files.length > 0 ? sanitizeCssPath(`assets/${files[0]}`) : "";
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  for (const entry of Object.values(manifest) as Array<{
    isEntry?: boolean;
    css?: string[];
  }>) {
    if (entry.isEntry && entry.css?.length) {
      return sanitizeCssPath(entry.css[0]);
    }
  }
  return "";
}

function renderDocument(element: React.ReactElement, location: string): string {
  const body = renderToStaticMarkup(
    <StaticRouter location={location}>{element}</StaticRouter>,
  );
  return `<!doctype html>${body}`;
}

// Replace the single placeholder <div data-guide-markdown-body=""> emitted by
// ProseArticle with the markdown-to-HTML string. This is the one and only
// call site that injects raw HTML into rendered output; markdown source is
// git-checked-in and sanitised by marked.
const PLACEHOLDER_REGEX = new RegExp(
  `<div ${MARKDOWN_BODY_MARKER}(?:=""|="")?></div>`,
);

function injectMarkdownBody(html: string, body: string): string {
  if (!PLACEHOLDER_REGEX.test(html)) {
    throw new Error(
      `Guide renderer did not emit a ${MARKDOWN_BODY_MARKER} placeholder`,
    );
  }
  return html.replace(PLACEHOLDER_REGEX, body);
}

// -- Main --
console.log("Building guides...");

if (!existsSync(DIST)) {
  console.error("Error: dist/ directory not found. Run 'vite build' first.");
  process.exit(1);
}

if (!existsSync(CONTENT)) {
  console.log("No guides found in content/guides/. Skipping guide build.");
  process.exit(0);
}

const mdFiles = readdirSync(CONTENT).filter((f) => f.endsWith(".md"));
if (mdFiles.length === 0) {
  console.log("No .md files found in content/guides/. Skipping guide build.");
  process.exit(0);
}

const cssPath = getCssPath();
const fathomSiteId = process.env.VITE_FATHOM_SITE_ID || "";

if (!cssPath) {
  console.warn("Warning: No CSS path found. Guide pages will have no styling.");
}

const sitemapEntries: SitemapEntry[] = [
  {
    loc: "https://reporemover.xyz/",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "monthly",
    priority: 1.0,
  },
  {
    loc: "https://reporemover.xyz/guides/",
    lastmod: new Date().toISOString().split("T")[0],
    changefreq: "monthly",
    priority: 0.8,
  },
];

const guides: GuideWithContent[] = [];

for (const file of mdFiles) {
  const raw = readFileSync(resolve(CONTENT, file), "utf-8");
  const { data, content } = matter(raw);
  const meta = data as GuideMeta;

  if (!meta.title || !meta.slug) {
    console.warn(`  Skipping ${file}: missing title or slug in frontmatter`);
    continue;
  }

  // Default the canonical if frontmatter omitted it.
  if (!meta.canonical) {
    meta.canonical = `https://reporemover.xyz/guides/${meta.slug}/`;
  }

  resetHeadings();
  const markdownHtml = marked.parse(content) as string;

  const rendered = renderDocument(
    <SingleGuideDocument
      meta={meta}
      cssPath={cssPath}
      fathomSiteId={fathomSiteId}
    />,
    `/guides/${meta.slug}/`,
  );
  const fullHtml = injectMarkdownBody(rendered, markdownHtml);

  const outDir = resolve(DIST, "guides", meta.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), fullHtml, "utf-8");

  guides.push({ meta, html: markdownHtml });

  sitemapEntries.push({
    loc: `https://reporemover.xyz/guides/${meta.slug}/`,
    lastmod:
      meta.lastmod || meta.date || new Date().toISOString().split("T")[0],
    changefreq: "monthly",
    priority: 0.7,
  });

  console.log(`  Built: /guides/${meta.slug}/`);
}

// Generate guides index page
const indexDir = resolve(DIST, "guides");
mkdirSync(indexDir, { recursive: true });
const indexHtml = renderDocument(
  <GuidesIndexDocument
    guides={guides}
    cssPath={cssPath}
    fathomSiteId={fathomSiteId}
  />,
  "/guides/",
);
writeFileSync(resolve(indexDir, "index.html"), indexHtml, "utf-8");
console.log("  Built: /guides/");

// Generate sitemap
writeFileSync(
  resolve(DIST, "sitemap.xml"),
  generateSitemap(sitemapEntries),
  "utf-8",
);
console.log(`  Sitemap: ${sitemapEntries.length} URLs`);

console.log(`\nDone! Built ${guides.length} guides.`);
