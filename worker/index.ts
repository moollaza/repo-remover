interface Env {
  ASSETS: Fetcher;
}

const CANONICAL_HOST = "reporemover.xyz";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    let shouldRedirect = false;

    // Force HTTPS
    if (url.protocol === "http:") {
      url.protocol = "https:";
      shouldRedirect = true;
    }

    // Redirect www to non-www
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      shouldRedirect = true;
    }

    if (shouldRedirect) {
      return Response.redirect(url.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);

    // Emit canonical Link header on every homepage response, regardless of
    // query string — covers inbound tracking variants (`/?ref=…`,
    // `/?utm_source=…`, `/?from=…`) that GSC was flagging as
    // "Duplicate without user-selected canonical".
    if (url.pathname === "/") {
      const headers = new Headers(response.headers);
      headers.set("Link", `<https://${CANONICAL_HOST}/>; rel="canonical"`);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
