"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Fires `service_view` once per service detail page mount (Phase 18). */
export function ServiceViewTracker({ service }: { service: string }) {
  useEffect(() => {
    track("service_view", { service });
  }, [service]);
  return null;
}
