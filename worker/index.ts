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

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
