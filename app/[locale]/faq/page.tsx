import { getTranslations, setRequestLocale } from "next-intl/server";
import { faqEntries, type FaqCategory } from "@/content/faq";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";

const CATEGORY_ORDER: FaqCategory[] = [
  "general",
  "booking",
  "warranty",
  "aftercare",
  "buildings",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return pageMetadata({
    locale,
    path: "/faq",
    title: t("title"),
    description: t("sub"),
  });
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const tAuth = await getTranslations("authentic");

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqEntries.map((e) => ({
            "@type": "Question",
            name: t(`items.${e.id}.q`),
            acceptedAnswer: {
              "@type": "Answer",
              text: t(`items.${e.id}.a`),
            },
          })),
        }}
      />
      <PageHero title={t("title")} sub={t("sub")} />
      <Section>
        <Container className="max-w-3xl space-y-14">
          {CATEGORY_ORDER.map((category) => {
            const items = faqEntries
              .filter((e) => e.category === category)
              .map((e) => ({
                id: e.id,
                question: t(`items.${e.id}.q`),
                answer: e.link ? (
                  <>
                    <p>{t(`items.${e.id}.a`)}</p>
                    <p className="mt-3">
                      <Link
                        href={e.link}
                        className="font-medium text-sk-red underline-offset-4 hover:underline"
                      >
                        {tAuth("links.faq")} →
                      </Link>
                    </p>
                  </>
                ) : (
                  t(`items.${e.id}.a`)
                ),
              }));
            if (items.length === 0) return null;
            return (
              <Reveal key={category}>
                <Heading level={2}>{t(`categories.${category}`)}</Heading>
                <div className="mt-6">
                  <Accordion items={items} />
                </div>
              </Reveal>
            );
          })}
        </Container>
      </Section>
    </main>
  );
}
