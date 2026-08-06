"use client";

import { useTranslations } from "next-intl";
import { takaiLineForRegion, TAKAI_COLUMNS } from "@/content/takai";
import { useRegion } from "@/components/providers/RegionProvider";
import { Heading } from "@/components/ui/Heading";

/**
 * Region-aware TAKAI product lineup: Signature line for UAE, Performance
 * line for Egypt (Premium Plus exists in both). Spec values only — warranty
 * terms never render from this table (content/warranty.ts owns those).
 */
export function TakaiLineup() {
  const t = useTranslations("takai");
  const { region } = useRegion();
  const line = takaiLineForRegion(region.id);

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
                <th
                  scope="row"
                  className="py-3 pe-4 text-start font-medium"
                  dir="ltr"
                >
                  {p.name}
                </th>
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
      <p className="mt-3 text-small text-paper-ink/50">{t("regionNote")}</p>
    </div>
  );
}
