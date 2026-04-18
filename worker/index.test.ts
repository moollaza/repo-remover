import { describe, expect, it } from "vitest";
import worker from "./index";

// Minimal fetcher stub for `env.ASSETS.fetch(request)` — returns a plain 200
// response so we can assert what the worker wraps around it.
const env = {
  ASSETS: {
    fetch: async () =>
      new Response("<!doctype html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }),
  },
} as unknown as Parameters<typeof worker.fetch>[1];

const call = (url: string) => worker.fetch(new Request(url, { redirect: "manual" }), env);

describe("worker redirects", () => {
  it("301s http to https", async () => {
    const res = await call("http://reporemover.xyz/");
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("https://reporemover.xyz/");
  });

  it("301s www to apex", async () => {
    const res = await call("https://www.reporemover.xyz/");
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("https://reporemover.xyz/");
  });

  it("301s http+www in a single hop", async () => {
    const res = await call("http://www.reporemover.xyz/");
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("https://reporemover.xyz/");
  });

  it("preserves path and query on redirect", async () => {
    const res = await call("http://www.reporemover.xyz/dashboard?foo=bar");
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("https://reporemover.xyz/dashboard?foo=bar");
  });
});

describe("canonical Link header", () => {
  it("emits canonical Link on the clean homepage", async () => {
    const res = await call("https://reporemover.xyz/");
    expect(res.status).toBe(200);
    expect(res.headers.get("Link")).toBe('<https://reporemover.xyz/>; rel="canonical"');
  });

  it.each([
    "https://reporemover.xyz/?ref=example1",
    "https://reporemover.xyz/?utm_source=example2",
    "https://reporemover.xyz/?from=example3.com",
    "https://reporemover.xyz/?ref=https%3A%2F%2Fexample4.com",
  ])("emits canonical Link for homepage query-string variant %s", async (url) => {
    const res = await call(url);
    expect(res.status).toBe(200);
    expect(res.headers.get("Link")).toBe('<https://reporemover.xyz/>; rel="canonical"');
  });

  it("does NOT emit canonical Link on non-homepage paths", async () => {
    const res = await call("https://reporemover.xyz/dashboard");
    expect(res.status).toBe(200);
    expect(res.headers.get("Link")).toBeNull();
  });

  it("does NOT emit canonical Link on /guides", async () => {
    const res = await call("https://reporemover.xyz/guides/bulk-delete-github-repositories/");
    expect(res.status).toBe(200);
    expect(res.headers.get("Link")).toBeNull();
  });
});
