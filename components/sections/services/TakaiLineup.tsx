"use client";

import { useTranslations } from "next-intl";
import { takaiLineForRegion, TAKAI_COLUMNS } from "@/content/takai";
import { warrantyTermForProduct } from "@/content/warranty";
import { useRegion } from "@/components/providers/RegionProvider";
import { Heading } from "@/components/ui/Heading";

/**
 * Region-aware TAKAI product lineup: Signature line for UAE, Performance
 * line for Egypt (Premium Plus exists in both). Warranty terms resolve
 * from content/warranty.ts ONLY (Egypt terms ops-confirmed 2026-08-06;
 * UAE non-Premium-Plus terms honest-TBC). The lifetime qualifier renders
 * in the same block — mandatory, see content/warranty.ts.
 */
export function TakaiLineup() {
  const t = useTranslations("takai");
  const tWarranty = useTranslations("warranty");
  const { region } = useRegion();
  const line = takaiLineForRegion(region.id);

  const termLabel = (productName: string) => {
    const term = warrantyTermForProduct(region.id, productName);
    if (term.kind === "lifetime") return t("terms.lifetime");
    if (term.kind === "years") return t(`terms.y${term.years}`);
    return t("terms.tbc");
  };

  return (
    <div>
      <Heading level={3} className="text-paper-ink">
        {t("heading")} — {t(`lines.${line.id}.name`)}
      </Heading>
      <p className="mt-1 text-small text-paper-ink/60">
        {t(`lines.${line.id}.tagline`)}
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-4xl border-collapse text-small">
          <thead>
            <tr className="border-b-2 border-paper-ink/20">
              <th className="py-3 pe-4 text-start font-medium">
                {t("columns.product")}
              </th>
              <th className="py-3 pe-4 text-start font-bold">
                {t("columns.warranty")}
              </th>
              {TAKAI_COLUMNS.map((col) => (
                <th key={col} className="py-3 pe-4 text-start font-medium">
                  {t(`columns.${col}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {line.products.map((p) => (
              <tr key={p.name} className="border-b border-paper-ink/10">
                <th scope="row" className="py-3 pe-4 text-start font-medium">
                  <span dir="ltr">{p.name}</span>
                  {p.matteAvailable && (
                    <span className="ms-2 inline-block rounded-card border border-paper-ink/20 px-1.5 py-0.5 text-eyebrow font-normal text-paper-ink/60">
                      {t("matteBadge")}
                    </span>
                  )}
                </th>
                <td className="py-3 pe-4 font-medium">{termLabel(p.name)}</td>
                {TAKAI_COLUMNS.map((col) => {
                  const value = col === "gloss" && p.gloss === null
                    ? t("matte")
                    : p[col];
                  return (
                    <td
                      key={col}
                      className="py-3 pe-4 text-paper-ink/70"
                      dir={col === "gloss" && p.gloss === null ? undefined : "ltr"}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {line.products.some((p) => p.matteAvailable) && (
        <p className="mt-3 max-w-prose text-small text-paper-ink/60">
          {t("matteNote")}
        </p>
      )}
      {/* Mandatory: lifetime never renders without its qualifier in the
          same block (Premium Plus is in every line). */}
      <p className="mt-4 max-w-prose text-small text-paper-ink/60">
        {tWarranty("qualifier.todo")}
      </p>
      <p className="mt-2 text-small text-paper-ink/50">{t("regionNote")}</p>
    </div>
  );
}
