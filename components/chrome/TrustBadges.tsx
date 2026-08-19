"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { paymentsForRegion, type PaymentMethod } from "@/content/payments";
import { useRegion } from "@/components/providers/RegionProvider";
import { cn } from "@/lib/cn";

/**
 * Footer payment-methods strip (Phase 18, replaces the empty stub). Region-
 * aware: Egypt instalment programmes for Egypt, Tabby for the UAE, cards +
 * wallets always. Logos sit on light chips (most marks are dark-on-light);
 * white-only marks opt into the dark chip via `onDark`.
 */
export function TrustBadges() {
  const t = useTranslations("footer.payments");
  const { region } = useRegion();
  const { installments, cards } = paymentsForRegion(region.id);

  return (
    <section aria-label={t("title")} className="mt-10 flex flex-col items-center gap-5">
      <h2 className="text-small font-medium text-fg-muted">{t("title")}</h2>
      {installments.length > 0 && (
        <Row key={`inst-${region.id}`} label={t("installments")} items={installments} />
      )}
      <Row label={t("cards")} items={cards} />
    </section>
  );
}

function Row({ label, items }: { label: string; items: PaymentMethod[] }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-eyebrow text-fg-subtle">{label}</p>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {items.map((m) => (
          <li
            key={m.id}
            title={m.name}
            className={cn(
              "flex h-10 w-20 items-center justify-center rounded-card border border-ink-700 px-2",
              m.onDark ? "bg-ink-900" : "bg-paper",
            )}
          >
            <Image
              src={m.src}
              alt={m.name}
              width={m.width}
              height={m.height}
              className="h-6 w-auto max-w-full object-contain"
              sizes="80px"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
