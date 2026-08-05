import { getTranslations } from "next-intl/server";
import { services } from "@/content/services";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";

/** Horizontal snap rail of the five services. */
export async function ServicesRail() {
  const t = await getTranslations("home.services");
  const tItems = await getTranslations("services.items");
  const tDetail = await getTranslations("services.detail");

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
          {services.map((s) => (
            <li key={s.id} className="w-72 shrink-0 snap-start">
              <Link
                href={`/services/${s.slug}`}
                className="group block rounded-card border border-ink-700 bg-ink-800 transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
              >
                <Placeholder
                  note={tDetail("placeholderNote")}
                  className="aspect-4/3 rounded-b-none border-x-0 border-t-0"
                />
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
