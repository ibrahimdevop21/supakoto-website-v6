import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { SITE_URL, localeUrl } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";

/**
 * /authentic — genuine TAKAI verification. STRUCTURE-SPEC → "/authentic".
 * Only the three facts Ibrahim confirmed (2026-08-16) appear here; counterfeit
 * film is discussed as a category, never as a named competitor (build guard);
 * documentation is "available on request", never handed over automatically;
 * we speak only for film installed at our branches. Written to be quoted:
 * fact first, then explanation; every FAQ answer stands alone.
 */

const FAQ_IDS = [1, 2, 3, 4, 5, 6] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "authentic" });
  return pageMetadata({
    locale,
    path: "/authentic",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function AuthenticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("authentic");
  const loc = locale === "ar" ? "ar" : "en";

  const faqItems = FAQ_IDS.map((n) => ({
    id: `auth-${n}`,
    question: t(`faq.${n}.q`),
    answer: t(`faq.${n}.a`),
  }));

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_IDS.map((n) => ({
            "@type": "Question",
            name: t(`faq.${n}.q`),
            acceptedAnswer: { "@type": "Answer", text: t(`faq.${n}.a`) },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SupaKoto",
          url: SITE_URL,
          description: t("hero.sub"),
          areaServed: [
            { "@type": "Country", name: "Egypt" },
            { "@type": "Country", name: "United Arab Emirates" },
          ],
          brand: {
            "@type": "Brand",
            name: "TAKAI",
            manufacturer: {
              "@type": "Organization",
              name: "Nippon Takai Trading & Innovation Co., Ltd.",
              address: { "@type": "PostalAddress", addressLocality: "Tokyo", addressCountry: "JP" },
            },
          },
          mainEntityOfPage: localeUrl(loc, "/authentic"),
        }}
      />

      {/* 1 — the position, stated plainly */}
      <PageHero eyebrow={t("eyebrow")} title={t("hero.title")} sub={t("hero.sub")} />

      {/* 2 — why counterfeits exist in this category (category-level only) */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <Reveal>
            <Eyebrow>{t("why.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("why.title")}</Heading>
            <p className="mt-4 max-w-prose text-fg-muted">{t("why.body")}</p>
          </Reveal>
          <RevealStagger className="grid gap-4 sm:grid-cols-2">
            {(["b1", "b2", "b3", "b4"] as const).map((k) => (
              <RevealItem key={k}>
                <Card className="h-full p-5 text-fg-muted">{t(`why.${k}`)}</Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* 3 — why TAKAI is different */}
      <Section tone="raised">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow>{t("takai.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("takai.title")}</Heading>
            <p className="mt-4 text-fg-muted">{t("takai.body")}</p>
          </Reveal>
          <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-3">
            {(["b1", "b2", "b3"] as const).map((k, i) => (
              <RevealItem key={k}>
                <Card className="h-full p-5">
                  <span className="font-display text-h3 font-bold text-sk-red">{i + 1}</span>
                  <p className="mt-2 text-fg">{t(`takai.${k}`)}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* 4 — what "authorized distributor" means */}
      <Section>
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow>{t("distributor.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("distributor.title")}</Heading>
          </Reveal>
          <RevealStagger className="mt-8 grid gap-4 md:grid-cols-3">
            {(["receive", "hold", "ask"] as const).map((k) => (
              <RevealItem key={k}>
                <Card className="h-full p-6">
                  <h3 className="font-display text-h3 font-bold">{t(`distributor.${k}.title`)}</h3>
                  <p className="mt-3 text-fg-muted">{t(`distributor.${k}.body`)}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* 5 — HOW TO VERIFY: the section that carries the page */}
      <Section tone="raised">
        <Container className="max-w-3xl">
          <Reveal>
            <Eyebrow>{t("verify.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("verify.title")}</Heading>
            <p className="mt-3 text-fg-muted">{t("verify.sub")}</p>
          </Reveal>
          <ol className="mt-10 space-y-8">
            {(["s1", "s2", "s3", "s4"] as const).map((k, i) => (
              <li key={k} className="flex gap-5">
                <span className="font-display text-h2 font-bold text-sk-red" aria-hidden>
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-display text-h3 font-bold">{t(`verify.${k}.title`)}</h3>
                  <p className="mt-2 text-fg-muted">{t(`verify.${k}.body`)}</p>
                  {k === "s1" && (
                    <Button href="/branches" variant="ghost" className="mt-4">
                      {t("verify.branchesCta")}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 6 — FAQ (each answer stands alone; mirrored in FAQPage JSON-LD) */}
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

      {/* 7 — CTA: branches + booking */}
      <section className="border-y border-ink-700 bg-ink-900 py-(--spacing-section)">
        <Container>
          <Reveal className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Heading level={2}>{t("cta.title")}</Heading>
              <p className="mt-2 text-fg-muted">{t("cta.sub")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/branches" variant="ghost">{t("cta.branches")}</Button>
              <Button href="/booking">{t("cta.book")}</Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
