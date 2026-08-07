import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { services } from "@/content/services";
import { serviceImage } from "@/content/gallery";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

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
  const tItems = await getTranslations("services.items");
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
                // Buildings is a different substrate — visually distinct
                // from the five automotive treatments, never just card six.
                s.substrate === "building" &&
                  "rounded-card border border-sk-red/40 bg-ink-900 p-6 md:p-8",
              )}
            >
              <div
                className={cn(
                  "relative aspect-4/3 overflow-hidden rounded-card border border-ink-700",
                  i % 2 === 1 && "md:order-last",
                )}
              >
                <Image
                  src={serviceImage(s.id)}
                  alt={tItems(`${s.id}.imageAlt`)}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                {s.substrate === "building" && (
                  <p className="mb-4 inline-block rounded-card border border-sk-red bg-sk-red-muted px-3 py-1 text-eyebrow text-fg">
                    {t("buildingBadge")}
                  </p>
                )}
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
