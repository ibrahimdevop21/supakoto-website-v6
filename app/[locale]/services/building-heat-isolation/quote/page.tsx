import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { BuildingQuoteForm } from "@/components/forms/BuildingQuoteForm";
import { Container } from "@/components/ui/Container";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "buildingQuote" });
  return pageMetadata({
    locale,
    path: "/services/building-heat-isolation/quote",
    title: t("title"),
    description: t("sub"),
  });
}

export default async function BuildingQuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("buildingQuote");

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container>
          <BuildingQuoteForm />
        </Container>
      </section>
    </main>
  );
}
