import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  services,
  RELATED_SERVICES,
  servicePath,
  type Service,
  type ServiceId,
} from "@/content/services";
import { serviceImage } from "@/content/gallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { PendingServiceCta } from "@/components/sections/services/PendingServiceCta";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/** Project photos shown beside the primary image, by gallery item id. */
const EXTRA_IMAGES: Partial<Record<ServiceId, string[]>> = {
  "building-heat-isolation": ["building-astrazeneca", "building-hustle-drip"],
  "surface-protection": [
    "surface-film-roll",
    "surface-marble-counter",
    "surface-marble-table",
  ],
};

/**
 * Body of a service detail page (Phase 17 re-split of /services). This is
 * the approved Phase-14 section content — image + project extras, problem /
 * solution, spec table, Premium Plus card (PPF only, qualifier in-block),
 * substrate-correct CTA — plus packages, FAQ and related services.
 * Marine / surface render their labelled pending state (no product claims).
 */
export async function ServiceDetailBody({ service: s }: { service: Service }) {
  const t = await getTranslations("services.detail");
  const tItems = await getTranslations("services.items");
  const tGallery = await getTranslations("gallery.items");
  const tWarranty = await getTranslations("warranty");
  const tAuth = await getTranslations("authentic");

  const solutions = (["b1", "b2", "b3", "b4"] as const).filter((b) =>
    tItems.has(`${s.id}.solutions.${b}`),
  );
  const extras = EXTRA_IMAGES[s.id] ?? [];
  const faqItems = Array.from({ length: s.faqCount }, (_, i) => ({
    id: `${s.id}-faq-${i + 1}`,
    question: tItems(`${s.id}.faq.${i + 1}.q`),
    answer: tItems(`${s.id}.faq.${i + 1}.a`),
  }));
  const related = RELATED_SERVICES[s.id]
    .map((id) => services.find((x) => x.id === id))
    .filter((x): x is Service => Boolean(x));

  return (
    <>
      {/* Overview: imagery + problem / solution / spec / tier / CTA */}
      <Section>
        <Container>
          <div className="grid items-start gap-10 md:grid-cols-2">
            <Reveal>
              <div className="relative aspect-4/3 overflow-hidden rounded-card border border-ink-700">
                <Image
                  src={serviceImage(s.id)}
                  alt={tItems(`${s.id}.imageAlt`)}
                  fill
                  priority
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

            <Reveal>
              <Heading level={2}>{t("problemHeading")}</Heading>
              <p className="mt-3 max-w-prose text-fg-muted">
                {tItems(`${s.id}.problem`)}
              </p>
              <Heading level={2} className="mt-8">
                {t("solutionHeading")}
              </Heading>
              <p className="mt-3 max-w-prose">{tItems(`${s.id}.solutionIntro`)}</p>
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

              {/* Pending-product services: labelled TODO in place of specs. */}
              {(s.id === "marine-ppf" || s.id === "surface-protection") && (
                <div className="mt-6 rounded-card border border-dashed border-ink-700 p-5">
                  <h3 className="text-h3 font-medium">{tItems(`${s.id}.pendingTitle`)}</h3>
                  <p className="mt-2 text-small text-fg-muted">
                    {tItems(`${s.id}.pendingBody`)}
                  </p>
                </div>
              )}

              {s.specKeys.length > 0 && (
                <div className="mt-6">
                  <Heading level={2}>{t("specHeading")}</Heading>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-72 border-collapse text-start">
                      <tbody>
                        {s.specKeys.map((key) => (
                          <tr key={key} className="border-b border-ink-700">
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
                      /* PPF's warranty spec row says "lifetime*" — the
                         qualifier must share its visual block (CLAUDE.md). */
                      <p className="mt-4 max-w-prose text-eyebrow text-fg-subtle">
                        {tWarranty("qualifier.text")}
                      </p>
                    )}
                    {s.id === "ppf" && (
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
                </div>
              )}

              {s.premiumPlus && (
                /* Premium Plus tier card — the only place outside /warranty
                   allowed to say "lifetime"; the qualifier ALWAYS shares the block. */
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
                  <Button href="/services/building-heat-isolation/quote">
                    {tItems(`${s.id}.quoteCta`)}
                  </Button>
                )}
                {(s.id === "marine-ppf" || s.id === "surface-protection") && (
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

      {/* Packages (vehicle services with tiers) */}
      {s.packageKeys.length > 0 && (
        <Section tone="raised">
          <Container>
            <Reveal>
              <Heading level={2}>{t("packagesHeading")}</Heading>
            </Reveal>
            <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {s.packageKeys.map((key) => (
                <RevealItem key={key}>
                  <div className="h-full rounded-card border border-ink-700 bg-ink-800 p-6">
                    <h3 className="text-h3 font-medium">
                      {tItems(`${s.id}.packages.${key}.name`)}
                    </h3>
                    <p className="mt-2 text-small text-fg-muted">
                      {tItems(`${s.id}.packages.${key}.coverage`)}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </Container>
        </Section>
      )}

      {/* FAQ */}
      {faqItems.length > 0 && (
        <Section>
          <Container className="max-w-3xl">
            <Reveal>
              <Heading level={2}>{t("faqHeading")}</Heading>
            </Reveal>
            <div className="mt-8">
              <Accordion items={faqItems} />
            </div>
          </Container>
        </Section>
      )}

      {/* Related services — internal linking (2–3 per page) */}
      {related.length > 0 && (
        <Section tone="raised">
          <Container>
            <Reveal>
              <Heading level={2}>{t("relatedHeading")}</Heading>
            </Reveal>
            <RevealStagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <RevealItem key={r.id}>
                  <Link
                    href={servicePath(r)}
                    className="group flex h-full flex-col rounded-card border border-ink-700 bg-ink-800 p-6 transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                  >
                    <h3 className="text-h3 font-medium text-fg group-hover:text-sk-red">
                      {tItems(`${r.id}.name`)}
                    </h3>
                    <p className="mt-2 text-small text-fg-muted">
                      {tItems(`${r.id}.benefit`)}
                    </p>
                  </Link>
                </RevealItem>
              ))}
            </RevealStagger>
          </Container>
        </Section>
      )}
    </>
  );
}
