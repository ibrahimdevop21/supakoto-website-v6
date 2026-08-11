import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";

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
  const tAbout = await getTranslations("about.cta");

  return (
    <main>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

      {/* Same wrapping grid as the homepage services section — the
          alternating full-bleed rows died in the 2026-08-11 restructure
          ("7 cards should behave the same in both places"). */}
      <section className="py-(--spacing-section)">
        <Container>
          <ServicesGrid />
        </Container>
      </section>

      <CtaBand
        title={tAbout("title")}
        buttonLabel={tAbout("button")}
        href="/booking"
      />
    </main>
  );
}
