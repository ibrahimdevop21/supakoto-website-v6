"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, track } from "@/lib/analytics";
import { captureAttribution } from "@/lib/attribution";

/**
 * Mounts once in the locale layout. Loads the pixels after hydration
 * (never render-blocking) and fires `page_view` on the first paint AND on
 * every App Router navigation — hard-load-only pageviews were V2's classic
 * failure. No duplicate initialisation: initAnalytics() is idempotent and
 * the pathname effect dedupes against the last fired path.
 */
export function Analytics() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    initAnalytics();
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    // Let the new document title settle before reading it.
    const id = window.setTimeout(() => track("page_view", { path: pathname }), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
