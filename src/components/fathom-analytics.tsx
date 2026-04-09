import * as Fathom from "fathom-client";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { debug } from "@/utils/debug";

export function FathomAnalytics() {
  const location = useLocation();
  const initializedRef = useRef(false);

  useEffect(() => {
    const siteId = import.meta.env.VITE_FATHOM_SITE_ID as string | undefined;
    if (!siteId) {
      debug.warn("Fathom Analytics: VITE_FATHOM_SITE_ID not set");
      return;
    }

    Fathom.load(siteId, {
      auto: false,
      excludedDomains: ["localhost", "127.0.0.1"],
      includedDomains: ["reporemover.xyz"],
    });
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;

    const url = location.pathname + location.search;
    Fathom.trackPageview({
      referrer: document.referrer,
      url,
    });
  }, [location.pathname, location.search]);

  return null;
}
