import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  services,
  getService,
  NOINDEX_SERVICE_IDS,
  servicePath,
} from "@/content/services";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { localeUrl } from "@/lib/site";
import { breadcrumbLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { ServiceDetailBody } from "@/components/sections/services/ServiceDetailBody";

/**
 * /services/<slug> — one page per service (Phase 17 re-split; SEO: one URL
 * per search intent). Building heat isolation has its own static route with
 * a diverged template, so it is excluded from this dynamic segment.
 * Marine / surface: rendered, `noindex, follow`, out of the sitemap until
 * TAKAI confirms a product (NOINDEX_SERVICE_IDS).
 */
const DYNAMIC = services.filter((s) => s.id !== "building-heat-isolation");

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    DYNAMIC.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const service = getService(slug);
  if (!service || service.id === "building-heat-isolation") return {};
  const t = await getTranslations({ locale, namespace: `services.items.${service.id}` });
  return pageMetadata({
    locale,
    path: servicePath(service),
    title: t("seoTitle"),
    description: t("seoDescription"),
    noindex: NOINDEX_SERVICE_IDS.has(service.id),
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = getService(slug);
  if (!service || service.id === "building-heat-isolation") notFound();
  const loc = locale === "ar" ? "ar" : "en";

  const t = await getTranslations("services.detail");
  const tIndex = await getTranslations("services.index");
  const tItem = await getTranslations(`services.items.${service.id}`);
  const tNav = await getTranslations("nav");
  const tAbout = await getTranslations("about.cta");
  const pending = service.id === "marine-ppf" || service.id === "surface-protection";

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: tItem("name"),
          description: tItem("seoDescription"),
          serviceType: tItem("name"),
          url: localeUrl(loc, servicePath(service)),
          provider: { "@type": "Organization", name: "SupaKoto", url: localeUrl(loc, "/") },
          areaServed: [
            { "@type": "Country", name: "Egypt" },
            { "@type": "Country", name: "United Arab Emirates" },
          ],
          ...(service.premiumPlus ? { brand: { "@type": "Brand", name: "TAKAI" } } : {}),
        }}
      />
      <JsonLd
        data={breadcrumbLd(loc, [
          [tNav("home"), "/"],
          [tIndex("eyebrow"), "/services"],
          [tItem("name"), servicePath(service)],
        ])}
      />
      {service.faqCount > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: Array.from({ length: service.faqCount }, (_, i) => ({
              "@type": "Question",
              name: tItem(`faq.${i + 1}.q`),
              acceptedAnswer: { "@type": "Answer", text: tItem(`faq.${i + 1}.a`) },
            })),
          }}
        />
      )}
      <PageHero eyebrow={tIndex("eyebrow")} title={tItem("h1")} sub={tItem("benefit")} />
      <ServiceDetailBody service={service} />
      {!pending && service.substrate === "vehicle" && (
        <CtaBand title={tAbout("title")} buttonLabel={t("bookCta")} href="/booking" />
      )}
    </main>
  );
}
