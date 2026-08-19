import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/sections/home/HeroCarousel";
import { PartnersBand } from "@/components/sections/home/PartnersBand";
import { ServicesSection } from "@/components/sections/home/ServicesSection";
import { TakaiComparison } from "@/components/sections/home/TakaiComparison";
import { FeatureGrid } from "@/components/sections/home/FeatureGrid";
import { BusinessBand } from "@/components/sections/home/BusinessBand";
import { CtaBand } from "@/components/sections/CtaBand";
import { Testimonials } from "@/components/sections/Testimonials";
import { byIds, HOME_TESTIMONIAL_IDS } from "@/content/testimonials";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMetadata({
    locale,
    path: "/",
    title: t("home.seoTitle"),
    description: t("home.metaDescription"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home.knowMore");
  const tAuth = await getTranslations("authentic");
  const loc = locale === "ar" ? "ar" : "en";

  return (
    <main>
      {/* Site-wide Organization node: SupaKoto = sole authorized TAKAI
          distributor (Phase 17 JSON-LD audit). */}
      <JsonLd data={organizationLd(loc, tAuth("hero.sub"), SITE_URL)} />
      {/* First screen: nav (fixed, pt-18 reserves its 72px) + hero +
          partners strip tile EXACTLY one viewport. h-[100svh], not
          min-h: total height is locked and never derived from slide
          content — the hero clips internally (min-h-0/overflow-hidden)
          and every copy row inside it has a reserved fixed height. */}
      <div className="flex h-[100svh] flex-col pt-18">
        <HeroCarousel />
        <PartnersBand />
      </div>
      <ServicesSection />
      <CtaBand
        title={t("title")}
        sub={t("sub")}
        buttonLabel={t("cta")}
        href="/services"
      />
      <TakaiComparison />
      <FeatureGrid />
      {/* Social proof harvested from V2 (Phase 18) — four named reviews, one per branch */}
      <Testimonials items={byIds(HOME_TESTIMONIAL_IDS)} />
      <BusinessBand />
    </main>
  );
}
