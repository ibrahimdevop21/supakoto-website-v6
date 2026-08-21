"use client";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { ar, enUS } from "date-fns/locale";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

/** Requests may be made for tomorrow up to this many days ahead. */
export const MAX_DAYS_AHEAD = 60;

/**
 * Inline month calendar for the wizard's date step (react-day-picker v10
 * on our tokens — the library CSS is not imported).
 *
 * - Today and past days disabled; forward limit MAX_DAYS_AHEAD.
 * - RTL-correct under Arabic (`dir`), Arabic month/weekday names from the
 *   date-fns `ar` locale, Western digits (`numerals="latn"`).
 * - Week starts Saturday for both regions (Ibrahim, 2026-08-21).
 * - Keyboard: arrows move, Enter/Space select (library behaviour); the
 *   calendar is inline on its own step, so there is nothing to Escape.
 * - No weekend / closure shading: ops has not supplied closure days
 *   (ASSETS-NEEDED). Nothing is hidden — disabled days stay visible.
 *
 * Value is an ISO date string (yyyy-MM-dd), matching the previous native
 * input so the WhatsApp body and intent log keep their format.
 */
export function DatePicker({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("booking.calendar");
  const isAr = locale === "ar";
  const dfLocale = isAr ? ar : enUS;

  const today = useMemo(() => startOfDay(new Date()), []);
  const first = addDays(today, 1);
  const last = addDays(today, MAX_DAYS_AHEAD);
  const selected = value ? parseISO(value) : undefined;

  return (
    <div id={id} className="rounded-card border border-ink-700 bg-ink-800 p-3 sm:p-4" dir={isAr ? "rtl" : "ltr"}>
      <DayPicker
        mode="single"
        required={false}
        selected={selected}
        onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
        locale={dfLocale}
        dir={isAr ? "rtl" : "ltr"}
        numerals="latn"
        weekStartsOn={6}
        defaultMonth={selected ?? first}
        startMonth={first}
        endMonth={last}
        disabled={[{ before: first }, { after: last }]}
        showOutsideDays={false}
        labels={{
          labelPrevious: () => t("prev"),
          labelNext: () => t("next"),
        }}
        classNames={{
          root: "sk-calendar select-none text-fg",
          months: "relative flex flex-col",
          month: "w-full",
          month_caption: "flex h-10 items-center justify-center",
          caption_label: "text-body font-medium",
          nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
          button_previous:
            "grid size-10 place-items-center rounded-card border border-ink-700 text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg disabled:opacity-30 disabled:hover:border-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red rtl:rotate-180",
          button_next:
            "grid size-10 place-items-center rounded-card border border-ink-700 text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg disabled:opacity-30 disabled:hover:border-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red rtl:rotate-180",
          chevron: "size-4 fill-current",
          month_grid: "mt-3 w-full border-collapse table-fixed",
          weekdays: "",
          weekday: "pb-2 text-center text-eyebrow font-normal text-fg-subtle",
          week: "",
          day: "p-0.5 text-center",
          // Stable `sk-day` hook for tests; 44px touch target at 390px.
          day_button: cn(
            "sk-day mx-auto grid aspect-square w-full max-w-11 place-items-center rounded-card text-small font-medium tabular-nums transition-colors",
            "hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sk-red",
            "disabled:cursor-not-allowed disabled:text-fg-subtle/50 disabled:hover:bg-transparent",
          ),
          selected: "[&>button]:bg-sk-red [&>button]:text-fg [&>button:hover]:bg-sk-red",
          today: "[&>button]:underline [&>button]:underline-offset-4",
          disabled: "",
          outside: "invisible",
          hidden: "invisible",
          focused: "",
        }}
      />
      <p className="mt-3 border-t border-ink-700 pt-3 text-small text-fg-muted" aria-live="polite">
        {t("selected")}:{" "}
        <span className="font-medium text-fg">
          {selected ? format(selected, "EEEE d MMMM yyyy", { locale: dfLocale }) : "—"}
        </span>
      </p>
    </div>
  );
}
