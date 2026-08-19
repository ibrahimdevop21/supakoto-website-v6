"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { track, type FormId } from "@/lib/analytics";

/**
 * Form shell for pages whose backend lands with later integrations.
 * Submission is faked locally; the visible stub note keeps it honest.
 */
export function StubForm({
  formId,
  submitLabel,
  successText,
  stubText,
  className,
  children,
}: {
  /** Analytics id — `form_submit` fires with it on submit (Phase 18). */
  formId: FormId;
  submitLabel: string;
  successText: string;
  stubText?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      data-track={`form:${formId}`}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        track("form_submit", { form: formId });
        setSubmitted(true);
      }}
    >
      {children}
      <div className="mt-6 space-y-3">
        {submitted ? (
          <p role="status" className="rounded-card border border-sk-red bg-sk-red-muted px-4 py-3">
            {successText}
          </p>
        ) : (
          <Button type="submit">{submitLabel}</Button>
        )}
        {stubText && (
          <p className="text-eyebrow text-fg-subtle">{stubText}</p>
        )}
      </div>
    </form>
  );
}
