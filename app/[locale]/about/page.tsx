import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Counter } from "@/components/ui/Counter";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import logoFull from "@/public/brand/logo-full.png";
import logoWhite from "@/public/brand/logo-white.png";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tNav = await getTranslations("nav");

  return (
    <main>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} sub={t("sub")} />

      {/* Logo lockup band — light/dark pair */}
      <section className="grid sm:grid-cols-2">
        <div className="flex items-center justify-center bg-paper p-14">
          <Image src={logoFull} alt={tNav("logoAlt")} className="h-20 w-auto" />
        </div>
        <div className="flex items-center justify-center border-t border-ink-700 bg-ink-900 p-14 sm:border-s sm:border-t-0">
          <Image src={logoWhite} alt={tNav("logoAlt")} className="h-20 w-auto" />
        </div>
      </section>

      {/* Who we are */}
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Eyebrow>{t("whoWeAre.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("whoWeAre.title")}</Heading>
            <p className="mt-6 text-fg-muted">{t("whoWeAre.body")}</p>
          </Reveal>
        </Container>
      </Section>

      {/* Stat counters — 4 up. Fourth stat is a deliberate TODO (no warranty
          figure allowed here; Ibrahim picks the metric). */}
      <Section tone="raised">
        <Container>
          <RevealStagger className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <RevealItem className="text-center">
              <Counter value={6} className="text-display" />
              <p className="mt-2 text-fg-muted">{t("stats.branches.label")}</p>
            </RevealItem>
            <RevealItem className="text-center">
              <Counter value={100} suffix="%" className="text-display" />
              <p className="mt-2 text-fg-muted">{t("stats.japanese.label")}</p>
            </RevealItem>
            <RevealItem className="text-center">
              <span className="font-display text-display font-bold">
                {t("stats.exclusive.value")}
              </span>
              <p className="mt-2 text-fg-muted">{t("stats.exclusive.label")}</p>
            </RevealItem>
            <RevealItem className="text-center">
              <span className="font-display text-display font-bold text-fg-subtle">
                {t("stats.todo.value")}
              </span>
              <p className="mt-2 text-eyebrow text-fg-subtle">
                {t("stats.todo.label")}
              </p>
            </RevealItem>
          </RevealStagger>
        </Container>
      </Section>

      {/* Vision / Mission / Values */}
      <Section>
        <Container>
          <RevealStagger className="grid gap-6 md:grid-cols-3">
            {(["vision", "mission", "values"] as const).map((key) => (
              <RevealItem key={key}>
                <Card className="h-full">
                  <Heading level={3}>{t(`vmv.${key}.title`)}</Heading>
                  <p className="mt-3 text-fg-muted">{t(`vmv.${key}.body`)}</p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      <CtaBand
        title={t("cta.title")}
        buttonLabel={t("cta.button")}
        href="/booking"
      />
    </main>
  );
}
