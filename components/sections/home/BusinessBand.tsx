import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** Split band: franchise on one side, B2B/fleet on the other. */
export async function BusinessBand() {
  const t = await getTranslations("home.business");

  return (
    <Section tone="raised">
      <Container>
        <Reveal>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
        </Reveal>
        <div className="mt-4 grid gap-px overflow-hidden rounded-card border border-ink-700 bg-ink-700 sm:grid-cols-2">
          <Reveal className="flex flex-col items-start gap-4 bg-ink-900 p-8">
            <Heading level={3}>{t("franchiseTitle")}</Heading>
            <p className="text-fg-muted">{t("franchiseSub")}</p>
            <Button variant="ghost" href="/franchise" className="mt-auto">
              {t("franchiseCta")}
            </Button>
          </Reveal>
          <Reveal className="flex flex-col items-start gap-4 bg-ink-900 p-8">
            <Heading level={3}>{t("b2bTitle")}</Heading>
            <p className="text-fg-muted">{t("b2bSub")}</p>
            <Button variant="ghost" href="/business" className="mt-auto">
              {t("b2bCta")}
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
