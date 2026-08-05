"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("chrome.locale");
  const locale = useLocale();
  const pathname = usePathname();
  const target = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={target}
      aria-label={t("aria")}
      className={
        "rounded-card border border-ink-700 px-3 py-1.5 text-small font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red " +
        (className ?? "")
      }
    >
      {t("label")}
    </Link>
  );
}
