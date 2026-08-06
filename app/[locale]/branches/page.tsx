import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
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
    title: t("title"),
    description: t("sub"),
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
            brand: "SupaKoto",
          }}
        />
      ))}
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container className="space-y-12">
          <BranchMap />
          <BranchGrid />
        </Container>
      </section>
    </main>
  );
}
