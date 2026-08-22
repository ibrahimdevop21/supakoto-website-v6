import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Phase 22: the policy describes what actually runs — every cookie with
 * its lifetime, the named platforms (Google / Meta / TikTok) and what
 * each receives, retention, and PDPL rights for Egypt + UAE. Sections in
 * ITEM_SECTIONS also render a bullet list from `sections.<key>.items`.
 * Guarded by scripts/check-privacy-claims.mjs: the build fails if this
 * copy ever claims "no advertising tracking" while pixels are configured.
 */
const SECTIONS = [
  "collect",
  "use",
  "cookies",
  "thirdParties",
  "retention",
  "rights",
  "contact",
] as const;
const ITEM_SECTIONS = new Set(["cookies", "thirdParties", "rights"]);
/** One constant drives BOTH the effective-from and last-updated lines. */
const POLICY_DATE = "2026-08-22";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return pageMetadata({
    locale,
    path: "/privacy",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <main>
      <PageHero
        title={t("title")}
        sub={`${t("effective", { date: POLICY_DATE })} · ${t("updated", { date: POLICY_DATE })}`}
      />
      <Section>
        <Container className="max-w-3xl space-y-12">
          {SECTIONS.map((key) => (
            <Reveal key={key}>
              <Heading level={2}>{t(`sections.${key}.title`)}</Heading>
              <p className="mt-4 text-fg-muted">{t(`sections.${key}.body`)}</p>
              {ITEM_SECTIONS.has(key) && (
                <ul className="mt-4 list-disc space-y-2 ps-6 text-fg-muted">
                  {(t.raw(`sections.${key}.items`) as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </Container>
      </Section>
    </main>
  );
}
