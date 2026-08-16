import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { localeUrl } from "@/lib/site";
import { branches } from "@/content/branches";
import { PageHero } from "@/components/sections/PageHero";
import { BranchGrid } from "@/components/sections/BranchGrid";
import { BranchMap } from "@/components/sections/BranchMap";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "branches" });
  return pageMetadata({
    locale,
    path: "/branches",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function BranchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("branches");
  const loc = locale === "ar" ? "ar" : "en";

  return (
    <main>
      {branches.map((b) => (
        <JsonLd
          key={b.id}
          data={{
            "@context": "https://schema.org",
            "@type": "AutomotiveBusiness",
            name: `SupaKoto — ${t(`items.${b.id}.name`)}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: t(`items.${b.id}.address`),
              addressCountry: b.region === "egypt" ? "EG" : "AE",
            },
            telephone: b.phone,
            url: localeUrl(loc, "/branches"),
            geo: {
              "@type": "GeoCoordinates",
              latitude: b.coords.lat,
              longitude: b.coords.lng,
            },
            parentOrganization: { "@type": "Organization", name: "SupaKoto" },
            brand: { "@type": "Brand", name: "TAKAI" },
          }}
        />
      ))}
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container className="space-y-12">
          <BranchMap />
          <BranchGrid />
          {/* Buildings install at the customer's property, not at a branch. */}
          <p className="max-w-prose text-small text-fg-muted">
            {t("buildingNote")}
          </p>
        </Container>
      </section>
    </main>
  );
}
