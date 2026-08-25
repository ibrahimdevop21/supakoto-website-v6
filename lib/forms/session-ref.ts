"use client";

import { generateRef, isRef } from "@/lib/ref";

/**
 * One SK-ref per submission attempt that SURVIVES a reload or a locale
 * switch (Ibrahim, 2026-08-25): the ref links the email, the WhatsApp
 * message and the Meta eventID, so a remount must not mint a second one
 * for the same customer. Scoped per surface ("booking", "contact", …) so a
 * customer who books a car and later writes to /contact still gets two
 * distinct requests. Cleared on a confirmed send so the NEXT request on the
 * same surface gets a fresh ref.
 *
 * sessionStorage only — dies with the tab, never crosses devices, holds no
 * personal data (the ref is random). Falls back to a per-mount ref where
 * storage is unavailable (private mode quirks, storage disabled).
 */

const PREFIX = "sk-ref:";

export function takeSessionRef(scope: string): string {
  if (typeof window === "undefined") return generateRef();
  try {
    const existing = window.sessionStorage.getItem(PREFIX + scope);
    if (existing && isRef(existing)) return existing;
    const fresh = generateRef();
    window.sessionStorage.setItem(PREFIX + scope, fresh);
    return fresh;
  } catch {
    return generateRef();
  }
}

export function clearSessionRef(scope: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PREFIX + scope);
  } catch {
    // storage unavailable — nothing to clear
  }
}
