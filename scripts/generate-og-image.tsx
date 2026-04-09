/**
 * Generates OG images (light + dark) using Satori + Resvg.
 *
 * Uses the same brand tokens as the landing page hero:
 *   --brand-blue: #0066ff
 *   --brand-cyan: #06b6d4 (light) / #22d3ee (dark)
 *
 * Run: bun run scripts/generate-og-image.tsx
 */
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ── Brand tokens (from src/globals.css) ──
const brand = {
  blue: "#0066ff",
  cyan: { light: "#06b6d4", dark: "#22d3ee" },
};

const light = {
  bg: "#ffffff",
  heading: "#11181c",
  body: "#71717a",
  trust: "#52525b",
  trustDot: "#d4d4d8",
  pillBg: "#f4f4f5",
  pillBorder: "#e4e4e7",
  pillText: "#71717a",
};

const dark = {
  bg: "#0a0a0a",
  heading: "#ecedee",
  body: "rgba(255,255,255,0.5)",
  trust: "rgba(255,255,255,0.45)",
  trustDot: "rgba(255,255,255,0.2)",
  pillBg: "rgba(255,255,255,0.06)",
  pillBorder: "rgba(255,255,255,0.1)",
  pillText: "rgba(255,255,255,0.6)",
};

// ── Load Inter static fonts (close match to system ui-sans-serif) ──
const fontRegular = readFileSync(
  join(import.meta.dirname, "fonts", "Inter-Regular.ttf"),
);
const fontBold = readFileSync(
  join(import.meta.dirname, "fonts", "Inter-Bold.ttf"),
);

const fonts = [
  {
    name: "Inter",
    data: fontRegular,
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: fontBold,
    weight: 700 as const,
    style: "normal" as const,
  },
];

// ── OG Image Component ──
function OgImage(theme: "light" | "dark") {
  const t = theme === "light" ? light : dark;
  const cyan = theme === "light" ? brand.cyan.light : brand.cyan.dark;

  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        background: t.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter",
      },
      children: {
        type: "div",
        props: {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "28px",
            padding: "0 80px",
          },
          children: [
            // Pill badge
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  background: t.pillBg,
                  border: `1px solid ${t.pillBorder}`,
                  fontSize: "18px",
                  color: t.pillText,
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: brand.blue,
                      },
                    },
                  },
                  "250,000+ repos cleaned up!",
                ],
              },
            },
            // Heading
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0px",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "72px",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: "-2px",
                        color: t.heading,
                      },
                      children: "The bulk cleanup tool",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "72px",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: "-2px",
                        backgroundImage: `linear-gradient(to right, ${brand.blue}, ${cyan})`,
                        backgroundClip: "text",
                        color: "transparent",
                      },
                      children: "GitHub should have built.",
                    },
                  },
                ],
              },
            },
            // Subheading
            {
              type: "div",
              props: {
                style: {
                  fontSize: "24px",
                  color: t.body,
                  lineHeight: 1.5,
                  maxWidth: "680px",
                },
                children:
                  "25,000+ developers stopped deleting repos one by one. Review, archive, or delete in bulk from one screen.",
              },
            },
            // Trust badges
            {
              type: "div",
              props: {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontSize: "17px",
                  color: t.trust,
                },
                children: [
                  "Free forever",
                  {
                    type: "div",
                    props: {
                      style: {
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: t.trustDot,
                      },
                    },
                  },
                  "100% in-browser",
                  {
                    type: "div",
                    props: {
                      style: {
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: t.trustDot,
                      },
                    },
                  },
                  "Token never leaves your device",
                ],
              },
            },
          ],
        },
      },
    },
  };
}

// ── Generate ──
async function generate(theme: "light" | "dark", filename: string) {
  const svg = await satori(OgImage(theme) as any, {
    width: 1200,
    height: 630,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const png = resvg.render().asPng();

  const outPath = join(import.meta.dirname, "..", "public", "images", filename);
  writeFileSync(outPath, png);
  console.log(
    `${filename}: ${(png.byteLength / 1024).toFixed(0)}KB → ${outPath}`,
  );
}

await generate("light", "og-light.png");
await generate("dark", "og-dark.png");

// Copy light as default
const lightPng = readFileSync(
  join(import.meta.dirname, "..", "public", "images", "og-light.png"),
);
writeFileSync(
  join(import.meta.dirname, "..", "public", "images", "og-image.png"),
  lightPng,
);
console.log("og-image.png → copied from og-light.png");
