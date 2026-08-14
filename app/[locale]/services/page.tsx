import { getTranslations, setRequestLocale } from "next-intl/server";
import { services, type ServiceId } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import {
  ServiceShowcase,
  ShowcaseAnchorNav,
} from "@/components/sections/services/ServiceShowcase";
import { JsonLd } from "@/components/JsonLd";

/**
 * Phase 14: the one services page. Every service renders inline here
 * (anchored sections) — the old per-service detail URLs 301 to
 * /services#<id>. Only the building SEO landing page and its quote
 * funnel remain as standalone routes.
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
    title: t("title"),
    description: t("sub"),
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services.index");
  const tItems = await getTranslations("services.items");
  const tAbout = await getTranslations("about.cta");

  const labels = Object.fromEntries(
    services.map((s) => [s.id, tItems(`${s.id}.name`)]),
  ) as Record<ServiceId, string>;

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: tItems(`${s.id}.name`),
              description: tItems(`${s.id}.benefit`),
              provider: { "@type": "Organization", name: "SupaKoto" },
              areaServed: ["EG", "AE"],
            },
          })),
        }}
      />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

      <section className="py-8">
        <Container>
          <ShowcaseAnchorNav ariaLabel={t("title")} labels={labels} />
        </Container>
      </section>

      <ServiceShowcase />

      <CtaBand
        title={tAbout("title")}
        buttonLabel={tAbout("button")}
        href="/booking"
      />
    </main>
  );
}
