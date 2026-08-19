import { getTranslations } from "next-intl/server";
import { branches } from "@/content/branches";
import type { Testimonial } from "@/content/testimonials";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { Stars, TestimonialsCarousel } from "@/components/sections/TestimonialsCarousel";

/**
 * Customer testimonials (Phase 18, rev. 2 — Ibrahim's three corrections,
 * 2026-08-19).
 *
 * 1. The visible aggregate is the REAL Google figure: the count-weighted
 *    average of the branch listings in content/branches.ts (`reviews`) and
 *    their summed count — never the number of cards on the page. It is
 *    shown as text only: Google's review-snippet rules don't allow an
 *    AggregateRating built from third-party (Google) listings, and an
 *    AggregateRating over the 29 displayed cards would contradict the
 *    displayed 1,570 — so no AggregateRating node is emitted. The Review
 *    nodes still cover exactly the cards displayed on the page.
 * 2. Reviews are never translated — each card renders in the customer's
 *    language with its own dir (the carousel handles that).
 * 3. Carousel with equal-height cards + expand (TestimonialsCarousel).
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
  const t = await getTranslations("testimonials");
  const tBranches = await getTranslations("branches.items");

  const google = googleAggregate();

  return (
    <Section tone={tone} className={className}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "SupaKoto",
          url: SITE_URL,
          review: items.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
            reviewBody: r.text,
            inLanguage: r.lang,
            ...(r.date ? { datePublished: r.date } : {}),
          })),
        }}
      />
      <Container>
        <Reveal className="text-center">
          <Eyebrow className="justify-center">{t("eyebrow")}</Eyebrow>
          <Heading level={2}>{t("title")}</Heading>
          {google && (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-fg-muted">
              <Stars value={google.rating} />
              <span>
                {t("aggregate", {
                  rating: google.rating.toFixed(1),
                  count: google.count.toLocaleString("en-US"),
                })}
              </span>
            </p>
          )}
        </Reveal>
        <div className="mt-12">
          <TestimonialsCarousel
            items={items.map((r) => ({
              id: r.id,
              name: r.name,
              branchName: tBranches(`${r.branch}.name`),
              lang: r.lang,
              rating: r.rating,
              ratingLabel: t("ratingAria", { rating: r.rating }),
              text: r.text,
            }))}
            labels={{
              carousel: t("carousel"),
              readMore: t("readMore"),
              close: t("close"),
              prev: t("prev"),
              next: t("next"),
              position: t("position"),
            }}
          />
        </div>
      </Container>
    </Section>
  );
}

/**
 * Count-weighted mean of the per-branch Google ratings (Σ rating×count /
 * Σ count) and the summed count. Null if no branch carries figures.
 * 2026-08-19: 699×4.9 + 439×4.8 + 363×4.8 + 69×4.9 = 7,612.8 / 1,570 = 4.849 → 4.8.
 */
export function googleAggregate(): { rating: number; count: number } | null {
  const rated = branches.filter((b) => b.reviews);
  const count = rated.reduce((a, b) => a + (b.reviews?.count ?? 0), 0);
  if (count === 0) return null;
  const sum = rated.reduce((a, b) => a + (b.reviews?.rating ?? 0) * (b.reviews?.count ?? 0), 0);
  return { rating: Math.round((sum / count) * 10) / 10, count };
}
