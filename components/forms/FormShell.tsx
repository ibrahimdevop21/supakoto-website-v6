"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { track, type FormId } from "@/lib/analytics";
import { generateRef } from "@/lib/ref";
import { logIntent } from "@/lib/intent";
import { useRegion } from "@/components/providers/RegionProvider";

/**
 * Real submitting shell for the five site forms (Phase 23 — replaces the
 * StubForm that discarded submissions). Generates the SK-ref client-side,
 * POSTs multipart to /api/forms (→ Resend → team inbox), shows the ref on
 * success, and keeps the visitor's input on failure. The hidden "website"
 * input is the honeypot the API route checks. form_submit stays GA4-only
 * until Ibrahim approves the per-form platform mapping (LD-3, doc 23).
 */
export function FormShell({
  formId,
  submitLabel,
  successText,
  className,
  children,
}: {
  formId: FormId;
  submitLabel: string;
  successText: string;
  className?: string;
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");
  const { region } = useRegion();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [ref, setRef] = useState<string | null>(null);

  return (
    <form
      data-track={`form:${formId}`}
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        if (state === "sending") return;
        setState("sending");
        const fd = new FormData(e.currentTarget);
        const newRef = generateRef();
        fd.set("form", formId);
        fd.set("ref", newRef);
        fd.set("locale", document.documentElement.lang);
        try {
          const res = await fetch("/api/forms", { method: "POST", body: fd });
          if (!res.ok) throw new Error(String(res.status));
          setRef(newRef);
          setState("sent");
          track("form_submit", { form: formId, ref: newRef });
          logIntent("form", {
            ref: newRef,
            region: region.id,
            branch: null,
            service: formId,
            draft: Object.fromEntries(
              [...fd.entries()].filter(([, v]) => typeof v === "string"),
            ),
          });
        } catch {
          setState("error");
        }
      }}
    >
      {children}
      {/* Honeypot — humans never see it, bots fill it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />
      <div className="mt-6 space-y-3">
        {state === "sent" ? (
          <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-3">
            {successText}
            <span dir="ltr" className="ms-2 font-medium">
              {tCommon("formRef")} {ref}
            </span>
          </p>
        ) : (
          <>
            <Button type="submit" disabled={state === "sending"}>
              {state === "sending" ? tCommon("formSending") : submitLabel}
            </Button>
            {state === "error" && (
              <p role="alert" className="rounded-card border border-ink-700 bg-ink-900 px-4 py-3 text-fg-muted">
                {tCommon("formError")}
              </p>
            )}
          </>
        )}
      </div>
    </form>
  );
}
