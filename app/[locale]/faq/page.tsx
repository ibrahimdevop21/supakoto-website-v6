import { getTranslations, setRequestLocale } from "next-intl/server";
import { faqEntries, type FaqCategory } from "@/content/faq";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";

const CATEGORY_ORDER: FaqCategory[] = [
  "general",
  "booking",
  "warranty",
  "aftercare",
];

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <Section>
        <Container className="max-w-3xl space-y-14">
          {CATEGORY_ORDER.map((category) => {
            const items = faqEntries
              .filter((e) => e.category === category)
              .map((e) => ({
                id: e.id,
                question: t(`items.${e.id}.q`),
                answer: t(`items.${e.id}.a`),
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
