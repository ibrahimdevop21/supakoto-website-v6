import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";

const SECTIONS = ["scope", "booking", "warranty", "liability"] as const;
const LAST_UPDATED = "2026-08-05";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  return (
    <main>
      <PageHero title={t("title")} sub={t("updated", { date: LAST_UPDATED })} />
      <Section>
        <Container className="max-w-3xl space-y-12">
          {SECTIONS.map((key) => (
            <Reveal key={key}>
              <Heading level={2}>{t(`sections.${key}.title`)}</Heading>
              <p className="mt-4 text-fg-muted">{t(`sections.${key}.body`)}</p>
            </Reveal>
          ))}
        </Container>
      </Section>
    </main>
  );
}
