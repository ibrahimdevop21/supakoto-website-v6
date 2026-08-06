import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { DOCUMENTARY_YOUTUBE_ID } from "@/lib/site";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("sub"),
  });
}

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
              <Counter value={25000} suffix="+" className="text-display" />
              <p className="mt-2 text-fg-muted">{t("stats.cars.label")}</p>
            </RevealItem>
          </RevealStagger>
        </Container>
      </Section>

      {/* Journey timeline — milestones ported from V2 (content is
          sanctioned); founding year 2016 per Ibrahim, overriding V2's 2018. */}
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Eyebrow>{t("journey.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("journey.title")}</Heading>
          </Reveal>
          <RevealStagger className="mt-10 space-y-0">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <RevealItem key={n}>
                <div className="relative flex gap-6 border-s border-ink-700 pb-10 ps-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -start-[5px] top-2 size-2.5 rounded-full bg-sk-red"
                  />
                  <div>
                    <span className="font-display text-h3 font-bold text-sk-red" dir="ltr">
                      {t(`journey.events.${n}.year`)}
                    </span>
                    <h3 className="mt-1 text-h3 font-medium">
                      {t(`journey.events.${n}.title`)}
                    </h3>
                    <p className="mt-1 text-fg-muted">
                      {t(`journey.events.${n}.desc`)}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* Documentary — renders once the YouTube id lands in lib/site.ts */}
      {DOCUMENTARY_YOUTUBE_ID && (
        <Section tone="raised">
          <Container className="max-w-4xl">
            <Reveal>
              <Eyebrow>{t("documentary.eyebrow")}</Eyebrow>
              <Heading level={2}>{t("documentary.title")}</Heading>
              <p className="mt-2 text-fg-muted">{t("documentary.sub")}</p>
              <div className="relative mt-8 aspect-video overflow-hidden rounded-card border border-ink-700">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${DOCUMENTARY_YOUTUBE_ID}`}
                  title={t("documentary.title")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 size-full"
                />
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

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
