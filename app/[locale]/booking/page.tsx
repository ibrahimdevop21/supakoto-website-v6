import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { BookingWizard } from "@/components/forms/BookingWizard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({
    locale,
    path: "/booking",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container>
          <BookingWizard />
        </Container>
      </section>
    </main>
  );
}
