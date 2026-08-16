import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { CARS_PROTECTED, DOCUMENTARY_YOUTUBE_ID } from "@/lib/site";
import { CtaBand } from "@/components/sections/CtaBand";
import { DocumentaryPlayer } from "@/components/sections/DocumentaryPlayer";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Counter } from "@/components/ui/Counter";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";

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
    title: t("seoTitle"),
    description: t("seoDescription"),
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
  const tAuth = await getTranslations("authentic");

  return (
    <main className="pt-18">
      {/* Documentary opens the page (Ibrahim's call — hero removed, the
          film IS the hero). Full container width, same as nav/footer. */}
      {DOCUMENTARY_YOUTUBE_ID && (
        <Section>
          <Container>
            <Reveal>
              <Eyebrow>{t("documentary.eyebrow")}</Eyebrow>
              <h1 className="font-display text-h1 font-bold text-balance">
                {t("documentary.title")}
              </h1>
              <p className="mt-3 max-w-2xl text-fg-muted">
                {t("documentary.sub")}
              </p>
              <DocumentaryPlayer videoId={DOCUMENTARY_YOUTUBE_ID} />
            </Reveal>
          </Container>
        </Section>
      )}

      {/* Our story — full container width like the video: the narrative
          paragraph sits (sticky) beside the 2016 → 2026 timeline */}
      <Section tone="raised">
        <Container className="grid gap-12 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>{t("journey.eyebrow")}</Eyebrow>
            <Heading level={2}>{t("whoWeAre.title")}</Heading>
            <p className="mt-6 text-fg-muted">{t("whoWeAre.body")}</p>
            <p className="mt-4">
              <Link
                href="/authentic"
                className="text-small font-medium text-sk-red underline-offset-4 hover:underline"
              >
                {tAuth("links.about")} →
              </Link>
            </p>
          </Reveal>
          <RevealStagger className="space-y-0">
            {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
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

      {/* Where the journey landed — today's numbers */}
      <Section>
        <Container>
          <Reveal className="text-center">
            <Heading level={2}>{t("stats.heading")}</Heading>
          </Reveal>
          <RevealStagger className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
            <RevealItem className="text-center">
              <Counter value={6} className="text-display" />
              <p className="mt-2 text-fg-muted">{t("stats.branches.label")}</p>
            </RevealItem>
            <RevealItem className="text-center">
              <Counter value={100} suffix="%" className="text-display" />
              <p className="mt-2 text-fg-muted">{t("stats.japanese.label")}</p>
            </RevealItem>
            <RevealItem className="text-center">
              {/* Image, not the 🇯🇵 emoji — regional-indicator emoji render as
                  letters on Windows (Dr. Amer review, 2026-08-16). Asset:
                  public/images/brand/flag-japan.webp; decorative, label carries meaning. */}
              <span className="inline-flex h-(--text-display) items-center justify-center">
                <Image
                  src="/images/brand/flag-japan.webp"
                  alt=""
                  width={96}
                  height={64}
                  className="h-12 w-auto rounded-sm ring-1 ring-ink-700"
                />
              </span>
              <p className="mt-2 text-fg-muted">
                <Link href="/authentic" className="underline-offset-4 hover:underline">
                  {t("stats.exclusive.label")}
                </Link>
              </p>
            </RevealItem>
            <RevealItem className="text-center">
              <Counter value={CARS_PROTECTED.baseline} suffix="+" className="text-display" />
              <p className="mt-2 text-fg-muted">{t("stats.cars.label")}</p>
            </RevealItem>
          </RevealStagger>
        </Container>
      </Section>

      {/* Vision / Mission / Values — what the story is in service of */}
      <Section tone="raised">
        <Container>
          <Reveal className="text-center">
            <Heading level={2}>{t("vmv.heading")}</Heading>
          </Reveal>
          <RevealStagger className="mt-12 grid gap-6 md:grid-cols-3">
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
