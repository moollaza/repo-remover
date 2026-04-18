/**
 * Dev-only CLS logger. Activate by appending `?debug-layout-shift=1` to the URL.
 * Subscribes to `layout-shift` PerformanceObserver entries and logs each shifted
 * node through the `debug` utility. No data leaves the browser.
 */

import { debug } from "@/utils/debug";

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  sources?: {
    currentRect: DOMRectReadOnly;
    node?: Node | null;
    previousRect: DOMRectReadOnly;
  }[];
  value: number;
}

const QUERY_FLAG = "debug-layout-shift";

function summarizeNode(node: Node | null | undefined): string {
  if (!node || !(node instanceof Element)) return "<unknown>";
  const id = node.id ? `#${node.id}` : "";
  const className =
    typeof node.className === "string" && node.className
      ? `.${node.className.split(/\s+/).filter(Boolean).slice(0, 3).join(".")}`
      : "";
  return `${node.tagName.toLowerCase()}${id}${className}`;
}

export function startCLSLoggerIfRequested(): (() => void) | undefined {
  if (typeof window === "undefined") return;
  if (!import.meta.env.DEV) return;
  if (typeof PerformanceObserver === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  if (params.get(QUERY_FLAG) !== "1") return;

  let cumulative = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as LayoutShiftEntry[]) {
      if (entry.hadRecentInput) continue;

      cumulative += entry.value;
      const sources = (entry.sources ?? []).map((source) => ({
        node: summarizeNode(source.node),
        currentRect: {
          height: source.currentRect.height,
          width: source.currentRect.width,
          x: source.currentRect.x,
          y: source.currentRect.y,
        },
        previousRect: {
          height: source.previousRect.height,
          width: source.previousRect.width,
          x: source.previousRect.x,
          y: source.previousRect.y,
        },
      }));

      debug.log("[cls]", {
        cumulative: Number(cumulative.toFixed(4)),
        shift: Number(entry.value.toFixed(4)),
        sources,
        startTime: entry.startTime,
      });
    }
  });

  try {
    observer.observe({ buffered: true, type: "layout-shift" });
  } catch (err) {
    debug.warn("CLS logger failed to start:", err);
    return;
  }

  debug.log("[cls] logger enabled via ?debug-layout-shift=1");

  return () => observer.disconnect();
}
