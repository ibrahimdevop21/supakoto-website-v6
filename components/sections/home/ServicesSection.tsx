import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";

/**
 * Homepage services section. Replaced the horizontal snap-rail in the
 * 2026-08-11 restructure: SupaKoto is not car-only — vehicles,
 * buildings, boats, and interior surfaces share one wrapping grid.
 */
export async function ServicesSection() {
  const t = await getTranslations("home.services");

  return (
    <Section>
      <Container>
        <Reveal>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <Heading level={2}>{t("title")}</Heading>
          <p className="mt-3 max-w-2xl text-fg-muted">{t("sub")}</p>
        </Reveal>
        <div className="mt-10">
          <ServicesGrid />
        </div>
        <Reveal className="mt-10">
          <Button variant="ghost" href="/services">
            {t("viewAll")}
          </Button>
        </Reveal>
      </Container>
    </Section>
  );
}
