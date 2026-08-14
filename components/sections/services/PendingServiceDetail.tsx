import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { serviceImage } from "@/content/gallery";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { PendingServiceCta } from "@/components/sections/services/PendingServiceCta";

/**
 * Detail page for services with NO confirmed TAKAI product (marine-ppf,
 * surface-protection). Deliberately minimal: general problem/solution
 * framing, a labelled TODO where a spec table would be, and a WhatsApp
 * conversation CTA. NO product codes, NO spec figures, NO warranty
 * terms, nothing adapted from the automotive PPF template — inventing
 * any of those is the SK-BLD error class. Launch is blocked on written
 * TAKAI confirmation (see ASSETS-NEEDED.md).
 */
export async function PendingServiceDetail({
  serviceId,
}: {
  serviceId: "marine-ppf" | "surface-protection";
}) {
  const t = await getTranslations("services.detail");
  const tItem = await getTranslations(`services.items.${serviceId}`);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: tItem("name"),
          description: tItem("seoDescription"),
          provider: { "@type": "Organization", name: "SupaKoto" },
          areaServed: ["EG", "AE"],
        }}
      />
      <PageHero title={tItem("name")} sub={tItem("benefit")} />

      {/* Hero visual — real photo for marine-ppf; surface-protection still
          uses a labelled placeholder until photography exists */}
      <section className="py-(--spacing-section)">
        <Container>
          <Reveal>
            <div className="relative aspect-video overflow-hidden rounded-card border border-ink-700 sm:aspect-21/9">
              <Image
                src={serviceImage(serviceId)}
                alt={tItem("imageAlt")}
                fill
                priority
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      <Section tone="raised">
        <Container className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <Heading level={2}>{t("problemHeading")}</Heading>
            <p className="mt-4 max-w-prose text-fg-muted">{tItem("problem")}</p>
          </Reveal>
          <Reveal>
            <Heading level={2}>{t("solutionHeading")}</Heading>
            <p className="mt-4 max-w-prose text-fg-muted">
              {tItem("solutionIntro")}
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Where the spec table will live — a labelled TODO, nothing else */}
      <Section>
        <Container>
          <Reveal>
            <Heading level={2}>{tItem("pendingTitle")}</Heading>
            <div className="mt-8 rounded-card border border-dashed border-ink-700 bg-ink-900 p-8">
              <p className="max-w-prose text-fg-muted">{tItem("pendingBody")}</p>
            </div>
            <div className="mt-8">
              <PendingServiceCta
                label={tItem("quoteCta")}
                message={tItem("waMessage")}
              />
            </div>
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}
