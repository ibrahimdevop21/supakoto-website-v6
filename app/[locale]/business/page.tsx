import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { BusinessForm } from "@/components/forms/BusinessForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "business" });
  return pageMetadata({
    locale,
    path: "/business",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

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
                  {/* Canonical buildings destination serves B2C and B2B —
                      this card only surfaces the commercial angle. */}
                  {key === "building" && (
                    <Button
                      variant="ghost"
                      href="/services/building-heat-isolation"
                      className="mt-5"
                    >
                      {t("segments.building.cta")}
                    </Button>
                  )}
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
