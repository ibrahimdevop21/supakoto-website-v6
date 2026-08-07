import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { vehicleServices } from "@/content/services";
import { serviceImage } from "@/content/gallery";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";

/** Horizontal snap rail of the five services. */
export async function ServicesRail() {
  const t = await getTranslations("home.services");
  const tItems = await getTranslations("services.items");

  return (
    <Section>
      <Container>
        <Reveal>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <Heading level={2}>{t("title")}</Heading>
        </Reveal>
      </Container>
      <div className="mt-10 overflow-x-auto pb-4 [scrollbar-width:thin]">
        <ul className="flex snap-x snap-mandatory gap-6 px-(--spacing-gutter) after:block after:w-px after:shrink-0">
          {vehicleServices.map((s) => (
            <li key={s.id} className="w-72 shrink-0 snap-start">
              <Link
                href={`/services/${s.slug}`}
                className="group block rounded-card border border-ink-700 bg-ink-800 transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={serviceImage(s.id)}
                    alt={tItems(`${s.id}.imageAlt`)}
                    fill
                    sizes="288px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-h3 font-medium text-fg group-hover:text-sk-red transition-colors">
                    {tItems(`${s.id}.name`)}
                  </h3>
                  <p className="mt-1 text-small text-fg-muted">
                    {tItems(`${s.id}.benefit`)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
