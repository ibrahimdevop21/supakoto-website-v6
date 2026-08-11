import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/sections/home/HeroCarousel";
import { PartnersBand } from "@/components/sections/home/PartnersBand";
import { ServicesRail } from "@/components/sections/home/ServicesRail";
import { WorkPreview } from "@/components/sections/home/WorkPreview";
import { FeatureGrid } from "@/components/sections/home/FeatureGrid";
import { BusinessBand } from "@/components/sections/home/BusinessBand";
import { CtaBand } from "@/components/sections/CtaBand";

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
    title: t("home.title"),
    description: t("footer.tagline"),
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

  return (
    <main>
      {/* First screen: nav (fixed, pt-18 reserves its 72px) + hero +
          partners strip tile EXACTLY one viewport. h-[100svh], not
          min-h: total height is locked and never derived from slide
          content — the hero clips internally (min-h-0/overflow-hidden)
          and every copy row inside it has a reserved fixed height. */}
      <div className="flex h-[100svh] flex-col pt-18">
        <HeroCarousel />
        <PartnersBand />
      </div>
      <ServicesRail />
      <CtaBand
        title={t("title")}
        sub={t("sub")}
        buttonLabel={t("cta")}
        href="/services"
      />
      <WorkPreview />
      <FeatureGrid />
      <BusinessBand />
    </main>
  );
}
