import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { FranchiseForm } from "@/components/forms/FranchiseForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "franchise" });
  return pageMetadata({
    locale,
    path: "/franchise",
    title: t("title"),
    description: t("sub"),
  });
}

export default async function FranchisePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("franchise");

  const faqItems = [1, 2, 3].map((n) => ({
    id: `ff-${n}`,
    question: t(`faq.${n}.q`),
    answer: t(`faq.${n}.a`),
  }));

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />

      {/* Why the brand — 4 value props */}
      <Section>
        <Container>
          <Reveal>
            <Heading level={2}>{t("whyHeading")}</Heading>
          </Reveal>
          <RevealStagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {([1, 2, 3, 4] as const).map((n) => (
              <RevealItem key={n}>
                <Card className="h-full">
                  <Heading level={3}>{t(`why.${n}.title`)}</Heading>
                  <p className="mt-2 text-small text-fg-muted">
                    {t(`why.${n}.body`)}
                  </p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* What you get */}
      <Section tone="raised">
        <Container>
          <Reveal>
            <Heading level={2}>{t("getHeading")}</Heading>
          </Reveal>
          <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <RevealItem key={n}>
                <div className="flex h-full items-start gap-3 rounded-card border border-ink-700 bg-ink-800 p-5">
                  <span aria-hidden className="mt-2.5 inline-block h-px w-5 shrink-0 bg-sk-red" />
                  <span>{t(`get.${n}`)}</span>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </Section>

      {/* Investment band — figures are Ibrahim's to supply */}
      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Heading level={2}>{t("investmentHeading")}</Heading>
            <p className="mt-6 rounded-card border border-ink-700 bg-ink-900 px-5 py-4 text-fg-subtle">
              {t("investmentTodo")}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Process timeline */}
      <Section tone="raised">
        <Container className="max-w-3xl">
          <Reveal>
            <Heading level={2}>{t("processHeading")}</Heading>
            <ol className="mt-8 space-y-6">
              {([1, 2, 3, 4, 5] as const).map((n) => (
                <li key={n} className="flex gap-5">
                  <span className="font-display text-h2 font-bold text-sk-red">
                    {n}
                  </span>
                  <span className="pt-2 text-fg-muted">
                    {t(`process.${n}`)}
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      {/* Application form */}
      <Section>
        <Container>
          <Reveal>
            <Heading level={2}>{t("formHeading")}</Heading>
          </Reveal>
          <div className="mt-8">
            <FranchiseForm />
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="raised">
        <Container className="max-w-3xl">
          <Reveal>
            <Heading level={2}>{t("faqHeading")}</Heading>
          </Reveal>
          <div className="mt-8">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
