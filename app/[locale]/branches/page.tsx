import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { BranchGrid } from "@/components/sections/BranchGrid";
import { Container } from "@/components/ui/Container";

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
      <PageHero title={t("title")} sub={t("sub")} />
      <section className="py-(--spacing-section)">
        <Container>
          <BranchGrid />
        </Container>
      </section>
    </main>
  );
}
