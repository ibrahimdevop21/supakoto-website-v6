import { getTranslations, setRequestLocale } from "next-intl/server";
import { warrantyRows } from "@/content/warranty";
import { TierBreakdown } from "@/components/sections/warranty/TierBreakdown";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warranty" });
  // Tier-neutral by construction: title/sub carry no figures, no "lifetime".
  return pageMetadata({
    locale,
    path: "/warranty",
    title: t("title"),
    description: t("sub"),
  });
}

export default async function WarrantyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("warranty");

  const faqItems = [1, 2, 3].map((n) => ({
    id: `wf-${n}`,
    question: t(`faq.${n}.q`),
    answer: t(`faq.${n}.a`),
  }));

  return (
    <main>
      {/* Hero — guarantee concept, no figure in the headline */}
      <PageHero title={t("title")} sub={t("sub")} />

      {/* Tier comparison — the core of the page. Source: content/warranty.ts.
          Filled per Ibrahim's 2026-08-06 decisions (vehicle-lifetime,
          all tiers transferable); the lifetime qualifier shares the block. */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <Heading level={2}>{t("tiersHeading")}</Heading>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-xl border-collapse">
                <thead>
                  <tr className="border-b-2 border-paper-ink/20 text-start">
                    <th className="py-4 pe-6 text-start" />
                    <th className="py-4 pe-6 text-start font-medium">
                      {t("tierStandard")}
                    </th>
                    <th className="py-4 text-start font-bold">
                      {t("tierPremiumPlus")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warrantyRows.map((row) => (
                    <tr key={row.key} className="border-b border-paper-ink/10">
                      <th
                        scope="row"
                        className="py-4 pe-6 text-start font-medium"
                      >
                        {t(`rows.${row.key}.label`)}
                      </th>
                      {row.key === "term" ? (
                        <>
                          <td className="py-4 pe-6 text-paper-ink/70">
                            {t("termStandard")}
                          </td>
                          <td className="py-4 font-bold">
                            {t("termLifetime")}
                          </td>
                        </>
                      ) : row.todo ? (
                        <>
                          <td className="py-4 pe-6 text-paper-ink/50">
                            {t("todoCell")}
                          </td>
                          <td className="py-4 text-paper-ink/50">
                            {t("todoCell")}
                          </td>
                        </>
                      ) : (
                        /* Terms apply equally to both tiers (only the term
                           length differs) — one value spans both columns. */
                        <>
                          <td className="py-4 pe-6 text-paper-ink/70">
                            {t(`rows.${row.key}.value`)}
                          </td>
                          <td className="py-4 text-paper-ink/70">
                            {t(`rows.${row.key}.value`)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Per-tier terms — REGION-AWARE (2026-08-16): only the
                visitor's line renders (UAE = TAKAI SILVER, Egypt = TAKAI 5),
                gated on the RegionPicker like branches and phones. */}
            <TierBreakdown />

            {/* Qualifier block — must sit adjacent to the lifetime cell. */}
            <p className="mt-6 max-w-prose rounded-card border border-paper-ink/20 bg-paper-ink/5 px-4 py-3 text-small text-paper-ink/70">
              {t("qualifier.text")}
            </p>

            {/* Buildings — different substrate, own block, never a vehicle
                tier. 10 years per TAKAI catalogue (TK-7099-IR). */}
            <div className="mt-10">
              <Heading level={3} className="text-paper-ink">
                {t("buildings.heading")}
              </Heading>
              <dl className="mt-4 divide-y divide-paper-ink/10 border-y border-paper-ink/10">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="font-medium" dir="ltr">
                    {t("buildings.product")}
                  </dt>
                  <dd className="text-paper-ink/70">{t("buildings.term")}</dd>
                </div>
              </dl>
              <p className="mt-3 max-w-prose text-small text-paper-ink/60">
                {t("buildings.note")}
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Registration steps */}
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Heading level={2}>{t("registration.heading")}</Heading>
            <ol className="mt-8 space-y-6">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex gap-5">
                  <span className="font-display text-h2 font-bold text-sk-red">
                    {n}
                  </span>
                  <span className="pt-2 text-fg-muted">
                    {t(`registration.steps.${n}`)}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      {/* Claim CTA */}
      <section className="border-y border-ink-700 bg-ink-900 py-(--spacing-section)">
        <Container>
          <Reveal className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Heading level={2}>{t("claimCta.title")}</Heading>
            <Button href="/warranty/claim">{t("claimCta.button")}</Button>
          </Reveal>
        </Container>
      </section>

      {/* FAQ */}
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Heading level={2}>{t("faqHeading")}</Heading>
          </Reveal>
          <div className="mt-8">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
