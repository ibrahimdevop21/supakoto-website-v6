"use client";

import { readAttribution } from "@/lib/attribution";
import { ATTRIBUTION_KEYS, type FormKey } from "@/lib/forms/spec";

/**
 * The one client path from any surface to /api/forms. Appends the
 * sk-attribution cookie's fields as attr_<key> (read-only use of
 * lib/attribution — the tracking layer itself is untouched), aborts after
 * 15 s, and resolves ONLY on a confirmed accept ({ok:true, id}). Anything
 * else throws a SubmitError so callers cannot show success by accident.
 */

export const SUBMIT_TIMEOUT_MS = 15_000;

export type SubmitFailure = "timeout" | "network" | "rejected" | "malformed";

export class SubmitError extends Error {
  constructor(
    public readonly kind: SubmitFailure,
    public readonly status?: number,
    /** The route's error code (bad_file, rate_limited, send_failed, …) when it sent one. */
    public readonly code?: string,
  ) {
    super(`form submit failed: ${kind}${status ? ` (${status})` : ""}${code ? ` ${code}` : ""}`);
  }
}

export interface SubmitInput {
  form: FormKey;
  ref: string;
  /** Plain fields; empty strings are still sent (the inbox shows the blank). */
  fields: Record<string, string>;
  /** Existing FormData (from a <form>) whose entries — including files — are kept. */
  formData?: FormData;
}

export async function submitForm({ form, ref, fields, formData }: SubmitInput): Promise<{ id: string }> {
  const fd = formData ?? new FormData();
  fd.set("form", form);
  fd.set("ref", ref);
  fd.set("locale", typeof document !== "undefined" ? document.documentElement.lang : "");
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);

  const attribution = readAttribution();
  if (attribution) {
    for (const key of ATTRIBUTION_KEYS) {
      const value = attribution[key];
      if (value) fd.set(`attr_${key}`, String(value));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("/api/forms", { method: "POST", body: fd, signal: controller.signal });
  } catch (error: unknown) {
    throw new SubmitError(error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network");
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new SubmitError("rejected", res.status, body?.error);
  }

  const body = (await res.json().catch(() => null)) as { ok?: boolean; id?: string } | null;
  if (!body || body.ok !== true || !body.id) throw new SubmitError("malformed", res.status);
  return { id: body.id };
}
