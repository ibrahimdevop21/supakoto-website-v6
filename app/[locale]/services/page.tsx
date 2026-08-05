import { getTranslations, setRequestLocale } from "next-intl/server";
import { services } from "@/content/services";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services.index");
  const tItems = await getTranslations("services.items");
  const tDetail = await getTranslations("services.detail");
  const tAbout = await getTranslations("about.cta");

  return (
    <main>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

      <section className="py-(--spacing-section)">
        <Container className="space-y-16">
          {services.map((s, i) => (
            <Reveal
              key={s.id}
              className={cn(
                "grid items-center gap-8 md:grid-cols-2",
              )}
            >
              <Placeholder
                note={tDetail("placeholderNote")}
                className={cn(
                  "aspect-4/3",
                  i % 2 === 1 && "md:order-last",
                )}
              />
              <div>
                <Heading level={2}>{tItems(`${s.id}.name`)}</Heading>
                <p className="mt-3 max-w-prose text-fg-muted">
                  {tItems(`${s.id}.benefit`)}
                </p>
                <Button
                  variant="ghost"
                  href={`/services/${s.slug}`}
                  className="mt-6"
                >
                  {t("detailsCta")}
                </Button>
              </div>
            </Reveal>
          ))}
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
