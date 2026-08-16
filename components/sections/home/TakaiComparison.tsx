"use client";

import { useTranslations } from "next-intl";
import { takaiLineForRegion, TAKAI_COLUMNS } from "@/content/takai";
import { useRegion } from "@/components/providers/RegionProvider";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * Homepage TAKAI tier comparison — replaced the Our Work gallery
 * preview (Ibrahim, 2026-08-11). Ported from V2's comparison table by
 * CONTENT, not design, using the ops-verified dataset in
 * content/takai.ts (region-aware: Signature/UAE, Performance/Egypt).
 *
 * NO warranty column, deliberately — same call V2 shipped with
 * (SHOW_WARRANTY_ROW = false): warranty is tier-scoped and "lifetime"
 * may only render on /warranty, the PPF section of /services, and the
 * Premium Plus tier card. The CTA routes to /services#ppf where terms live.
 */
export function TakaiComparison() {
  const t = useTranslations("home.takai");
  const tTakai = useTranslations("takai");
  const { region } = useRegion();
  const line = takaiLineForRegion(region.id);

  return (
    <Section tone="raised">
      <Container>
        <Reveal>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <Heading level={2}>{t("title")}</Heading>
          <p className="mt-3 max-w-2xl text-fg-muted">{t("sub")}</p>
        </Reveal>

        <Reveal className="mt-10 overflow-x-auto">
          <table className="w-full min-w-4xl border-collapse text-small">
            <thead>
              <tr className="border-b-2 border-ink-700">
                <th className="py-3 pe-4 text-start font-medium">
                  {tTakai("columns.product")}
                </th>
                {TAKAI_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="py-3 pe-4 text-start font-medium text-fg-muted"
                  >
                    {tTakai(`columns.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {line.products.map((p) => {
                const flagship = p.name === "TAKAI PREMIUM PLUS";
                return (
                  <tr
                    key={p.name}
                    className={cn(
                      "border-b border-ink-700",
                      flagship && "bg-sk-red/10",
                    )}
                  >
                    <th
                      scope="row"
                      className={cn(
                        "py-3 pe-4 text-start font-medium",
                        flagship && "text-sk-red",
                      )}
                    >
                      <span dir="ltr">{p.name}</span>
                      {p.matteAvailable && (
                        <span className="ms-2 inline-block rounded-card border border-ink-700 px-1.5 py-0.5 text-eyebrow font-normal text-fg-muted">
                          {tTakai("matteBadge")}
                        </span>
                      )}
                    </th>
                    {TAKAI_COLUMNS.map((col) => {
                      const matte = col === "gloss" && p.gloss === null;
                      return (
                        <td
                          key={col}
                          className="py-3 pe-4 text-fg-muted"
                          dir={matte ? undefined : "ltr"}
                        >
                          {matte ? tTakai("matte") : p[col]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Reveal>

        {line.products.some((p) => p.matteAvailable) && (
          <p className="mt-3 max-w-prose text-small text-fg-muted">
            {tTakai("matteNote")}
          </p>
        )}
        <p className="mt-2 text-small text-fg-muted">{tTakai("regionNote")}</p>

        <Reveal className="mt-8">
          <Button variant="ghost" href="/services#ppf">
            {t("cta")}
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
