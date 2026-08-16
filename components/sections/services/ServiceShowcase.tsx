import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { services, type Service, type ServiceId } from "@/content/services";
import { serviceImage } from "@/content/gallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { PendingServiceCta } from "@/components/sections/services/PendingServiceCta";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";

/**
 * All seven services inline on /services (Phase 14 — Ibrahim 2026-08-14:
 * one page instead of per-service sub-pages). Order is fixed: car PPF
 * leads, then buildings, then marine, then the remaining treatments.
 * Sections carry id=<serviceId> — nav, homepage cards, and the 301s from
 * the old detail URLs all target /services#<id>.
 */
const SHOWCASE_ORDER: ServiceId[] = [
  "ppf",
  "building-heat-isolation",
  "marine-ppf",
  "heat-isolation",
  "colour-change",
  "nano-ceramic",
  "surface-protection",
];

/** Project photos shown beside the primary image, by gallery item id. */
const EXTRA_IMAGES: Partial<Record<ServiceId, string[]>> = {
  "building-heat-isolation": ["building-astrazeneca", "building-hustle-drip"],
  "surface-protection": [
    "surface-film-roll",
    "surface-marble-counter",
    "surface-marble-table",
  ],
};

const ordered = SHOWCASE_ORDER.map(
  (id) => services.find((s) => s.id === id) as Service,
);

export function ShowcaseAnchorNav({
  ariaLabel,
  labels,
}: {
  ariaLabel: string;
  labels: Record<ServiceId, string>;
}) {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {SHOWCASE_ORDER.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          className="rounded-card border border-ink-700 px-4 py-2 text-small font-medium text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
        >
          {labels[id]}
        </a>
      ))}
    </nav>
  );
}

export async function ServiceShowcase() {
  const t = await getTranslations("services.detail");
  const tIndex = await getTranslations("services.index");
  const tItems = await getTranslations("services.items");
  const tGallery = await getTranslations("gallery.items");
  const tWarranty = await getTranslations("warranty");
  const tAuth = await getTranslations("authentic");

  return (
    <>
      {ordered.map((s, i) => {
        const flip = i % 2 === 1;
        const solutions = (["b1", "b2", "b3", "b4"] as const).filter((b) =>
          tItems.has(`${s.id}.solutions.${b}`),
        );
        const extras = EXTRA_IMAGES[s.id] ?? [];

        return (
          <Section
            key={s.id}
            id={s.id}
            tone={flip ? "raised" : "dark"}
            className="scroll-mt-24"
          >
            <Container>
              <Reveal>
                <Heading level={2}>{tItems(`${s.id}.name`)}</Heading>
                <p className="mt-2 max-w-2xl text-fg-muted">
                  {tItems(`${s.id}.benefit`)}
                </p>
              </Reveal>

              <div className="mt-10 grid items-start gap-10 md:grid-cols-2">
                {/* Imagery */}
                <Reveal className={cn(flip && "md:order-2")}>
                  <div className="relative aspect-4/3 overflow-hidden rounded-card border border-ink-700">
                    <Image
                      src={serviceImage(s.id)}
                      alt={tItems(`${s.id}.imageAlt`)}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  {extras.length > 0 && (
                    <div
                      className={cn(
                        "mt-4 grid gap-4",
                        extras.length === 2 ? "grid-cols-2" : "grid-cols-3",
                      )}
                    >
                      {extras.map((id) => (
                        <div
                          key={id}
                          className="relative aspect-square overflow-hidden rounded-card border border-ink-700"
                        >
                          <Image
                            src={`/images/gallery/${id}.webp`}
                            alt={tGallery(`${id}.alt`)}
                            fill
                            sizes="(min-width: 768px) 17vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Reveal>

                {/* Text content — existing detail-page keys, condensed */}
                <Reveal>
                  <p className="max-w-prose text-fg-muted">
                    {tItems(`${s.id}.problem`)}
                  </p>
                  <p className="mt-4 max-w-prose">
                    {tItems(`${s.id}.solutionIntro`)}
                  </p>
                  {solutions.length > 0 && (
                    <ul className="mt-4 space-y-3">
                      {solutions.map((b) => (
                        <li key={b} className="flex gap-3">
                          <span
                            aria-hidden
                            className="mt-2.5 inline-block h-px w-5 shrink-0 bg-sk-red"
                          />
                          <span>{tItems(`${s.id}.solutions.${b}`)}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {s.specKeys.length > 0 && (
                    <div className="mt-6">
                      <Accordion
                        items={[
                          {
                            id: `${s.id}-spec`,
                            question: t("specHeading"),
                            answer: (
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-72 border-collapse text-start">
                                  <tbody>
                                    {s.specKeys.map((key) => (
                                      <tr
                                        key={key}
                                        className="border-b border-ink-700"
                                      >
                                        <th
                                          scope="row"
                                          className="py-3 pe-6 text-start text-small font-medium text-fg"
                                        >
                                          {tItems(`${s.id}.spec.${key}.label`)}
                                        </th>
                                        <td className="py-3 text-small text-fg-muted">
                                          {tItems(`${s.id}.spec.${key}.value`)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {s.premiumPlus && (
                                  /* PPF's warranty spec row says "lifetime*"
                                     — the qualifier must share its visual
                                     block (CLAUDE.md warranty rule). */
                                  <p className="mt-4 max-w-prose text-eyebrow text-fg-subtle">
                                    {tWarranty("qualifier.text")}
                                  </p>
                                )}
                                {s.id === "ppf" && (
                                  /* Authenticity link-through — PPF only
                                     (spec: "/authentic linked from the PPF
                                     spec area"). */
                                  <p className="mt-4 text-small">
                                    <Link
                                      href="/authentic"
                                      className="font-medium text-sk-red underline-offset-4 hover:underline"
                                    >
                                      {tAuth("links.ppf")} →
                                    </Link>
                                  </p>
                                )}
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  )}

                  {s.premiumPlus && (
                    /* Premium Plus tier card — with the old /services/ppf
                       page folded in here, this PPF section is the only
                       place outside /warranty allowed to say "lifetime",
                       and the qualifier ALWAYS shares the block. */
                    <div className="mt-6 max-w-md rounded-card border border-sk-red bg-sk-red-muted p-6">
                      <h3 className="text-h3 font-medium text-fg">
                        {tItems(`${s.id}.premiumPlusCard.name`)}
                      </h3>
                      <p className="mt-2 text-small text-fg">
                        {tItems(`${s.id}.premiumPlusCard.term`)}
                      </p>
                      <p className="mt-3 text-eyebrow text-fg-muted">
                        {tWarranty("qualifier.text")}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3">
                    {s.substrate === "vehicle" && (
                      <Button href="/booking">{t("bookCta")}</Button>
                    )}
                    {s.id === "building-heat-isolation" && (
                      <>
                        <Button href="/services/building-heat-isolation/quote">
                          {tItems(`${s.id}.quoteCta`)}
                        </Button>
                        <Button
                          variant="ghost"
                          href="/services/building-heat-isolation"
                        >
                          {tIndex("fullDetails")}
                        </Button>
                      </>
                    )}
                    {(s.id === "marine-ppf" ||
                      s.id === "surface-protection") && (
                      <PendingServiceCta
                        label={tItems(`${s.id}.quoteCta`)}
                        message={tItems(`${s.id}.waMessage`)}
                      />
                    )}
                  </div>
                </Reveal>
              </div>
            </Container>
          </Section>
        );
      })}
    </>
  );
}
