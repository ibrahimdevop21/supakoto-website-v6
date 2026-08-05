import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/sections/home/HeroCarousel";
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
      <HeroCarousel />
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
