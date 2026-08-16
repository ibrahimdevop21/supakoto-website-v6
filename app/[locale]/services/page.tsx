import { getTranslations, setRequestLocale } from "next-intl/server";
import { services, servicePath } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";
import { localeUrl } from "@/lib/site";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";
import { JsonLd } from "@/components/JsonLd";

/**
 * /services — INDEX (Phase 17). Seven cards in the shared wrapping grid,
 * each linking to the service's own page. The Phase-14 inline sections
 * are gone: one URL per search intent.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services.index" });
  return pageMetadata({
    locale,
    path: "/services",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale === "ar" ? "ar" : "en";
  const t = await getTranslations("services.index");
  const tItems = await getTranslations("services.items");
  const tAbout = await getTranslations("about.cta");

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("h1"),
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: localeUrl(loc, servicePath(s)),
            name: tItems(`${s.id}.name`),
          })),
        }}
      />
      <PageHero eyebrow={t("eyebrow")} title={t("h1")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container>
          <ServicesGrid />
        </Container>
      </section>
      <CtaBand title={tAbout("title")} buttonLabel={tAbout("button")} href="/booking" />
    </main>
  );
}
