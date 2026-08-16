import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { serviceImage } from "@/content/gallery";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { localeUrl } from "@/lib/site";

/**
 * Buildings substrate — deliberately NOT the automotive detail template:
 * no packages, no before/after, no booking CTA. Single SKU (TK-7099-IR),
 * quotation funnel. Static route wins over /services/[slug].
 */

const SPEC_KEYS = [
  "product",
  "thickness",
  "vlt",
  "irRejection",
  "uvRejection",
  "tser",
  "warranty",
] as const;

const FUNNEL_STEPS = ["s1", "s2", "s3", "s4", "s5"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Standalone SEO entry point — own keyword-bearing title/description,
  // never inherited from the automotive heat-isolation metadata.
  const t = await getTranslations({
    locale,
    namespace: "services.items.building-heat-isolation",
  });
  return pageMetadata({
    locale,
    path: "/services/building-heat-isolation",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function BuildingHeatIsolationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services.detail");
  const tItem = await getTranslations("services.items.building-heat-isolation");
  const tNav = await getTranslations("nav");
  const tIndex = await getTranslations("services.index");
  const loc = locale === "ar" ? "ar" : "en";

  const faqItems = Array.from({ length: 4 }, (_, i) => ({
    id: `faq-${i + 1}`,
    question: tItem(`faq.${i + 1}.q`),
    answer: tItem(`faq.${i + 1}.a`),
  }));

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: tItem("name"),
          description: tItem("seoDescription"),
          serviceType: "Building window film installation",
          url: localeUrl(loc, "/services/building-heat-isolation"),
          provider: { "@type": "Organization", name: "SupaKoto", url: localeUrl(loc, "/") },
          areaServed: [
            { "@type": "Country", name: "Egypt" },
            { "@type": "Country", name: "United Arab Emirates" },
          ],
          brand: { "@type": "Brand", name: "TAKAI" },
        }}
      />
      <JsonLd
        data={breadcrumbLd(loc, [
          [tNav("home"), "/"],
          [tIndex("eyebrow"), "/services"],
          [tItem("name"), "/services/building-heat-isolation"],
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
      <PageHero eyebrow={tIndex("eyebrow")} title={tItem("h1")} sub={tItem("benefit")} />

      {/* Hero visual — our own building installation photography */}
      <section className="py-(--spacing-section)">
        <Container>
          <Reveal>
            <div className="relative aspect-video overflow-hidden rounded-card border border-ink-700 sm:aspect-21/9">
              <Image
                src={serviceImage("building-heat-isolation")}
                alt={tItem("imageAlt")}
                fill
                priority
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Problem / solution */}
      <Section tone="raised">
        <Container className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <Heading level={2}>{t("problemHeading")}</Heading>
            <p className="mt-4 max-w-prose text-fg-muted">{tItem("problem")}</p>
          </Reveal>
          <Reveal>
            <Heading level={2}>{t("solutionHeading")}</Heading>
            <p className="mt-4 max-w-prose text-fg-muted">
              {tItem("solutionIntro")}
            </p>
            <ul className="mt-4 space-y-3">
              {(["b1", "b2", "b3", "b4"] as const).map((b) => (
                <li key={b} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-2.5 inline-block h-px w-5 shrink-0 bg-sk-red"
                  />
                  <span>{tItem(`solutions.${b}`)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      {/* Spec table — single SKU, honest positioning below it */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <Heading level={2}>{t("specHeading")}</Heading>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-96 border-collapse text-start">
                <tbody>
                  {SPEC_KEYS.map((key) => (
                    <tr key={key} className="border-b border-paper-ink/10">
                      <th
                        scope="row"
                        className="py-4 pe-6 text-start font-medium"
                      >
                        {tItem(`spec.${key}.label`)}
                      </th>
                      <td className="py-4 text-paper-ink/70">
                        {tItem(`spec.${key}.value`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-prose text-small text-paper-ink/70">
              {tItem("positioning")}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* The quotation funnel */}
      <Section>
        <Container>
          <Reveal>
            <Heading level={2}>{tItem("funnel.title")}</Heading>
          </Reveal>
          <RevealStagger className="mt-8 grid gap-4 md:grid-cols-5">
            {FUNNEL_STEPS.map((step, i) => (
              <RevealItem key={step}>
                <div className="h-full rounded-card border border-ink-700 bg-ink-800 p-5">
                  <span
                    aria-hidden
                    className="font-display text-h2 font-bold text-sk-red"
                    dir="ltr"
                  >
                    {i + 1}
                  </span>
                  <p className="mt-2 text-small text-fg-muted">
                    {tItem(`funnel.${step}`)}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="raised">
        <Container className="max-w-3xl">
          <Reveal>
            <Heading level={2}>{t("faqHeading")}</Heading>
          </Reveal>
          <div className="mt-8">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </Section>

      <CtaBand
        title={tItem("name")}
        sub={tItem("benefit")}
        buttonLabel={tItem("quoteCta")}
        href="/services/building-heat-isolation/quote"
      />
    </main>
  );
}
