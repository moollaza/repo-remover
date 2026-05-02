import { readFileSync } from "node:fs";
import { join } from "node:path";

const headers = readFileSync(join(process.cwd(), "public/_headers"), "utf8");

function getCspDirective(name: string) {
  const cspLine = headers
    .split("\n")
    .find((line) => line.trim().startsWith("Content-Security-Policy:"));

  if (!cspLine) {
    throw new Error("Content-Security-Policy header not found");
  }

  const csp = cspLine.replace("Content-Security-Policy:", "").trim();
  const directive = csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));

  if (!directive) {
    throw new Error(`${name} directive not found`);
  }

  return directive;
}

describe("security headers", () => {
  it("allows analytics scripts without allowing arbitrary inline scripts", () => {
    const scriptSrc = getCspDirective("script-src");

    expect(scriptSrc).toContain("https://cdn.usefathom.com");
    expect(scriptSrc).toContain("https://static.cloudflareinsights.com");
    expect(scriptSrc).toContain(
      "'sha256-p0aBrMzpnkf1W+WssHA7u8Dcs07QBLuCZk+qHMgaaRA='",
    );
    expect(scriptSrc).toContain(
      "'sha256-L9HLFYyR5JDTA5pLMLp9jIL7U1oLBvmejMSej0mKijE='",
    );
    expect(scriptSrc).toContain(
      "'sha256-Wk6URvTt3pzt1bR6v9EUJr4RM7W4d5pOAP5l6B5hbDw='",
    );
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("*");
  });

  it("allows required analytics beacon destinations", () => {
    const connectSrc = getCspDirective("connect-src");

    expect(connectSrc).toContain("https://*.usefathom.com");
    expect(connectSrc).toContain("https://cloudflareinsights.com");
  });
});
