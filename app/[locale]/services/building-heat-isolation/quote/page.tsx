import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { BuildingQuoteForm } from "@/components/forms/BuildingQuoteForm";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";

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
    title: t("seoTitle"),
    description: t("seoDescription"),
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
  const tNav = await getTranslations("nav");
  const tIndex = await getTranslations("services.index");
  const tItem = await getTranslations("services.items.building-heat-isolation");
  const loc = locale === "ar" ? "ar" : "en";

  return (
    <main>
      <JsonLd
        data={breadcrumbLd(loc, [
          [tNav("home"), "/"],
          [tIndex("eyebrow"), "/services"],
          [tItem("name"), "/services/building-heat-isolation"],
          [t("title"), "/services/building-heat-isolation/quote"],
        ])}
      />
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container>
          <BuildingQuoteForm />
        </Container>
      </section>
    </main>
  );
}
