import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getService, services } from "@/content/services";
import { serviceImage } from "@/content/gallery";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { BeforeAfter } from "@/components/sections/services/BeforeAfter";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/JsonLd";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    services.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  const t = await getTranslations({
    locale,
    namespace: `services.items.${service.id}`,
  });
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: t("name"),
    description: t("benefit"),
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = getService(slug);
  if (!service) notFound();

  const t = await getTranslations("services.detail");
  const tItem = await getTranslations(`services.items.${service.id}`);
  const tWarranty = await getTranslations("warranty");

  const solutions = ["b1", "b2", "b3", "b4"].filter((b) =>
    tItem.has(`solutions.${b}`),
  );
  const faqItems = Array.from({ length: service.faqCount }, (_, i) => ({
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
          description: tItem("benefit"),
          provider: { "@type": "Organization", name: "SupaKoto" },
          areaServed: ["EG", "AE"],
        }}
      />
      <PageHero title={tItem("name")} sub={tItem("benefit")} />

      {/* Hero visual */}
      <section className="py-(--spacing-section)">
        <Container>
          <Reveal>
            <div className="relative aspect-video overflow-hidden rounded-card border border-ink-700 sm:aspect-21/9">
              <Image
                src={serviceImage(service.id)}
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
              {solutions.map((b) => (
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

      {/* Spec table — light surface */}
      <Section tone="paper">
        <Container>
          <Reveal>
            <Heading level={2}>{t("specHeading")}</Heading>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-96 border-collapse text-start">
                <tbody>
                  {service.specKeys.map((key) => (
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
            {service.premiumPlus && (
              <p className="mt-4 max-w-prose text-small text-paper-ink/60">
                {tWarranty("qualifier.todo")}
              </p>
            )}
          </Reveal>
        </Container>
      </Section>

      {/* Before / after */}
      <Section>
        <Container>
          <Reveal>
            <Heading level={2}>{t("beforeAfterHeading")}</Heading>
            <div className="mt-8">
              <BeforeAfter />
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Packages */}
      <Section tone="raised">
        <Container>
          <Reveal>
            <Heading level={2}>{t("packagesHeading")}</Heading>
          </Reveal>
          <RevealStagger
            className={cn(
              "mt-8 grid gap-4",
              service.premiumPlus ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3",
            )}
          >
            {service.packageKeys.map((key) => (
              <RevealItem key={key}>
                <div className="h-full rounded-card border border-ink-700 bg-ink-800 p-6">
                  <h3 className="text-h3 font-medium">
                    {tItem(`packages.${key}.name`)}
                  </h3>
                  <p className="mt-2 text-small text-fg-muted">
                    {tItem(`packages.${key}.coverage`)}
                  </p>
                </div>
              </RevealItem>
            ))}
            {service.premiumPlus && (
              <RevealItem>
                {/* Premium Plus tier card — the only place outside /warranty
                    and this PPF page allowed to say "lifetime", and the
                    qualifier ALWAYS shares this block. */}
                <div className="h-full rounded-card border border-sk-red bg-sk-red-muted p-6">
                  <h3 className="text-h3 font-medium text-fg">
                    {tItem("premiumPlusCard.name")}
                  </h3>
                  <p className="mt-2 text-small text-fg">
                    {tItem("premiumPlusCard.term")}
                  </p>
                  <p className="mt-3 text-eyebrow text-fg-muted">
                    {tWarranty("qualifier.todo")}
                  </p>
                </div>
              </RevealItem>
            )}
          </RevealStagger>
        </Container>
      </Section>

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

      <CtaBand
        title={tItem("name")}
        buttonLabel={t("bookCta")}
        href="/booking"
      />
    </main>
  );
}
