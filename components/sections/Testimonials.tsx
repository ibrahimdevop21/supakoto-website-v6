import { getLocale, getTranslations } from "next-intl/server";
import { branches } from "@/content/branches";
import {
  aggregate,
  testimonials as allTestimonials,
  type Testimonial,
} from "@/content/testimonials";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * Customer testimonials (Phase 18). Server-rendered, no client JS.
 *
 * - `items` is the exact list shown on the page; JSON-LD (Review +
 *   AggregateRating) marks up ONLY those items (Ibrahim, 2026-08-19).
 * - The visible aggregate line reads the per-branch public ratings from
 *   content/branches.ts when any are set (count-weighted), else the mean of
 *   the whole harvested set — never a typed-in number.
 * - Text shown in the non-original language is labelled "translated".
 */
export async function Testimonials({
  items,
  tone = "raised",
  className,
}: {
  items: Testimonial[];
  tone?: "dark" | "raised";
  className?: string;
}) {
  if (items.length === 0) return null;
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const t = await getTranslations("testimonials");
  const tBranches = await getTranslations("branches.items");

  const visibleAgg = branchAggregate() ?? aggregate(allTestimonials);
  const shownAgg = aggregate(items);

  return (
    <Section tone={tone} className={className}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "SupaKoto",
          url: SITE_URL,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: shownAgg.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: shownAgg.count,
          },
          review: items.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            reviewBody: r.text[locale],
            inLanguage: locale,
            ...(r.date ? { datePublished: r.date } : {}),
          })),
        }}
      />
      <Container>
        <Reveal className="text-center">
          <Eyebrow className="justify-center">{t("eyebrow")}</Eyebrow>
          <Heading level={2}>{t("title")}</Heading>
          <p className="mt-4 flex items-center justify-center gap-2 text-fg-muted">
            <Stars value={visibleAgg.rating} />
            <span>
              {t("aggregate", { rating: visibleAgg.rating.toFixed(1), count: visibleAgg.count })}
            </span>
          </p>
        </Reveal>
        <RevealStagger
          className={cn(
            "mt-12 grid gap-6",
            items.length >= 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
            items.length === 4 && "lg:grid-cols-4",
          )}
        >
          {items.map((r) => (
            <RevealItem key={r.id} className="h-full">
              <figure className="flex h-full flex-col rounded-card border border-ink-700 bg-ink-800 p-6">
                <Stars value={r.rating} label={t("ratingAria", { rating: r.rating })} />
                <blockquote
                  className="mt-4 flex-1 text-fg-muted"
                  lang={locale}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <p>{r.text[locale]}</p>
                </blockquote>
                <figcaption className="mt-5 border-t border-ink-700 pt-4 text-small">
                  <span className="block font-medium text-fg" dir="auto">
                    {r.name}
                  </span>
                  <span className="block text-fg-subtle">
                    {tBranches(`${r.branch}.name`)}
                  </span>
                  {r.original !== locale && (
                    <span className="mt-1 block text-eyebrow text-fg-subtle">
                      {t("translated", { lang: t(r.original === "ar" ? "langAr" : "langEn") })}
                    </span>
                  )}
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}

/** Count-weighted mean of the per-branch public ratings, or null if none are set. */
function branchAggregate(): { rating: number; count: number } | null {
  const rated = branches.filter((b) => b.reviews);
  if (rated.length === 0) return null;
  const count = rated.reduce((a, b) => a + (b.reviews?.count ?? 0), 0);
  if (count === 0) return null;
  const sum = rated.reduce((a, b) => a + (b.reviews?.rating ?? 0) * (b.reviews?.count ?? 0), 0);
  return { rating: Math.round((sum / count) * 10) / 10, count };
}

function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="inline-flex items-center gap-0.5 text-sk-red"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn("size-4", i <= Math.round(value) ? "fill-current" : "fill-ink-700")}
          aria-hidden
        >
          <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" />
        </svg>
      ))}
    </span>
  );
}
