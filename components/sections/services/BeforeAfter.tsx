"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Placeholder } from "@/components/ui/Placeholder";

/**
 * Before/after comparison. A range input drives the reveal — fully
 * keyboard-accessible, no drag handlers needed. Media are placeholders.
 */
export function BeforeAfter() {
  const t = useTranslations("services.detail");
  const [value, setValue] = useState(50);
  const id = useId();

  return (
    <div className="relative aspect-video overflow-hidden rounded-card border border-ink-700">
      {/* After layer (full) */}
      <Placeholder
        note={`${t("afterLabel")} — ${t("placeholderNote")}`}
        className="absolute inset-0 rounded-none border-0"
      >
        <span className="font-display text-h2 font-bold text-fg-subtle">
          {t("afterLabel")}
        </span>
      </Placeholder>

      {/* Before layer, clipped from the inline-start side */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        dir="ltr"
      >
        <Placeholder
          note={`${t("beforeLabel")} — ${t("placeholderNote")}`}
          className="absolute inset-0 rounded-none border-0 bg-[linear-gradient(135deg,#2b2226,var(--color-ink-900))]"
        >
          <span className="font-display text-h2 font-bold text-fg-subtle">
            {t("beforeLabel")}
          </span>
        </Placeholder>
      </div>

      {/* Divider */}
      <div
        aria-hidden
        className="absolute inset-y-0 w-0.5 bg-sk-red"
        style={{ left: `${value}%` }}
      />

      <label htmlFor={id} className="sr-only">
        {t("beforeAfterHeading")}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        dir="ltr"
        onChange={(e) => setValue(Number(e.target.value))}
        className="absolute inset-x-0 bottom-4 z-10 mx-auto w-2/3 accent-sk-red"
      />
    </div>
  );
}
