import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { ClaimForm } from "@/components/forms/ClaimForm";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warrantyClaim" });
  return pageMetadata({
    locale,
    path: "/warranty/claim",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function WarrantyClaimPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("warrantyClaim");
  const tNav = await getTranslations("nav");
  const loc = locale === "ar" ? "ar" : "en";

  return (
    <main>
      <JsonLd
        data={breadcrumbLd(loc, [
          [tNav("home"), "/"],
          [tNav("warrantyPolicy"), "/warranty"],
          [t("title"), "/warranty/claim"],
        ])}
      />
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container>
          <ClaimForm />
        </Container>
      </section>
    </main>
  );
}
