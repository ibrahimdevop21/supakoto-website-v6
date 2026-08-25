"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { track, type FormId } from "@/lib/analytics";
import { generateRef } from "@/lib/ref";
import { logIntent } from "@/lib/intent";
import { submitForm } from "@/lib/forms/submit";
import { refOnlyWhatsAppUrl } from "@/lib/forms/whatsapp";
import { useRegion } from "@/components/providers/RegionProvider";

/**
 * Submitting shell for the five standalone forms. One SK-ref per visitor
 * session (reused across retries so the inbox never sees two refs for one
 * person), multipart POST via submitForm() (attribution appended, 15 s
 * timeout), success ONLY on a confirmed accept. On failure the input is
 * kept and a WhatsApp fallback carrying the ref is offered — the lead is
 * never stranded. The hidden "website" input is the honeypot the API route
 * checks. form_submit stays GA4-only until Ibrahim approves the per-form
 * platform mapping (LD-3, doc 23).
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
  const locale = useLocale();
  const { region } = useRegion();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [ref] = useState<string>(() => generateRef());

  const whatsappUrl = refOnlyWhatsAppUrl(region.id, ref, locale);
  const whatsappLink = (label: string) => (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-track={`whatsapp:form:${formId}`}
      // "contact" is the nearest existing WhatsAppSource; adding a "form" source
      // is a tracking-layer change and belongs on that branch.
      onClick={() => track("whatsapp_click", { source: "contact", region: region.id, ref })}
      className="inline-flex items-center justify-center gap-2 rounded-card border border-ink-700 px-6 py-3 text-body font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
    >
      {label}
    </a>
  );

  return (
    <form
      data-track={`form:${formId}`}
      className={className}
      onSubmit={async (e) => {
        e.preventDefault();
        if (state === "sending") return;
        setState("sending");
        const fd = new FormData(e.currentTarget);
        try {
          await submitForm({ form: formId, ref, fields: {}, formData: fd });
        } catch {
          setState("error");
          return;
        }
        setState("sent");
        track("form_submit", { form: formId, ref });
        logIntent("form", {
          ref,
          region: region.id,
          branch: null,
          service: formId,
          draft: Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string")),
        });
      }}
    >
      {children}
      {/* Honeypot — humans never see it, bots fill it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="mt-6 space-y-3">
        {state === "sent" ? (
          <>
            <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-3">
              {successText}
              <span dir="ltr" className="ms-2 font-medium">
                {tCommon("formRef")} {ref}
              </span>
            </p>
            <p className="text-small text-fg-muted">{tCommon("keepRef")}</p>
            <p className="text-small text-fg-muted">{tCommon("whatsappOptional")}</p>
            {whatsappLink(tCommon("continueOnWhatsApp"))}
          </>
        ) : (
          <>
            <Button type="submit" disabled={state === "sending"}>
              {state === "sending" ? tCommon("formSending") : submitLabel}
            </Button>
            {state === "error" && (
              <div className="space-y-3">
                <p role="alert" className="rounded-card border border-ink-700 bg-ink-900 px-4 py-3 text-fg-muted">
                  {tCommon("formError")}
                </p>
                {whatsappLink(tCommon("sendOnWhatsApp"))}
              </div>
            )}
          </>
        )}
      </div>
    </form>
  );
}
