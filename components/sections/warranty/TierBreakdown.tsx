"use client";

import { useTranslations } from "next-intl";
import { useRegion } from "@/components/providers/RegionProvider";
import { tierBreakdownForRegion } from "@/content/warranty";
import { Heading } from "@/components/ui/Heading";

/**
 * Per-product warranty terms on /warranty — REGION-AWARE (Dr. Amer /
 * Ibrahim, 2026-08-16). Only the visitor's own line renders: a UAE
 * visitor sees TAKAI SILVER, never the Egypt list with "TAKAI 5".
 * Region comes from the RegionPicker (same source as branches and
 * phone numbers). The lifetime qualifier renders on the page directly
 * beneath this block — do not move this component away from it.
 */
export function TierBreakdown() {
  const t = useTranslations("warranty");
  const tTakai = useTranslations("takai");
  const { region } = useRegion();
  const groups = tierBreakdownForRegion(region.id);

  const termLabel = (term: (typeof groups)[number]["term"]) =>
    term.kind === "lifetime"
      ? tTakai("terms.lifetime")
      : term.kind === "years"
        ? tTakai(`terms.y${term.years}`)
        : tTakai("terms.tbc");

  return (
    <div className="mt-10">
      <Heading level={3} className="text-paper-ink">
        {t("breakdown.heading")}
      </Heading>
      <p className="mt-2 text-small font-medium text-paper-ink/60">
        {t(`breakdown.${region.id}`)}
      </p>
      <dl className="mt-2 divide-y divide-paper-ink/10 border-y border-paper-ink/10">
        {groups.map((group) => (
          <div
            key={group.products.join("/")}
            className="flex items-center justify-between gap-4 py-3"
          >
            <dt className="font-medium" dir="ltr">
              {group.products.join(" / ")}
            </dt>
            <dd
              className={
                group.term.kind === "lifetime"
                  ? "font-bold"
                  : "text-paper-ink/70"
              }
            >
              {termLabel(group.term)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 max-w-prose text-small text-paper-ink/60">
        {tTakai("regionNote")}
      </p>
    </div>
  );
}
