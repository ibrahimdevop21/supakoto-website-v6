import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { CareersForm } from "@/components/forms/CareersForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "careers" });
  return pageMetadata({
    locale,
    path: "/careers",
    title: t("title"),
    description: t("sub"),
  });
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <Section>
        <Container className="space-y-14">
          <Reveal>
            <Heading level={2}>{t("openingsHeading")}</Heading>
            <p className="mt-4 max-w-prose rounded-card border border-ink-700 bg-ink-900 px-5 py-4 text-fg-muted">
              {t("noOpenings")}
            </p>
          </Reveal>
          <Reveal>
            <Heading level={2}>{t("formHeading")}</Heading>
            <div className="mt-8">
              <CareersForm />
            </div>
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}
