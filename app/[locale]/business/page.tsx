import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { BusinessForm } from "@/components/forms/BusinessForm";

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("business");

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />

      <Section>
        <Container>
          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {(["fleet", "dealers", "building"] as const).map((key) => (
              <RevealItem key={key}>
                <Card className="h-full">
                  <Heading level={3}>{t(`segments.${key}.title`)}</Heading>
                  <p className="mt-3 text-fg-muted">{t(`segments.${key}.body`)}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      <Section tone="raised">
        <Container>
          <Reveal>
            <Heading level={2}>{t("formHeading")}</Heading>
          </Reveal>
          <div className="mt-8">
            <BusinessForm />
          </div>
        </Container>
      </Section>
    </main>
  );
}
