import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * Tile photography — wired 2026-08-16 (Dr. Amer review, item 8: the tiles
 * shipped as text-only dark boxes; the image slot had never been built).
 * All four are SupaKoto × TAKAI watermarked shots from the sanctioned V2
 * harvest already living under public/images. Decorative (alt="") — the
 * title carries the meaning. Never a car photo on a buildings surface.
 */
const TILES = [
  { key: "branches", href: "/branches", wide: true, image: "/images/branches/tagamoa.webp" }, // aerial of the Tagamoa branch
  { key: "takai", href: "/services#ppf", wide: false, image: "/images/gallery/sk-034.webp" }, // TAKAI film gloss on a bonnet
  { key: "warranty", href: "/warranty", wide: false, image: "/images/gallery/sk-148.webp" }, // Prado after full protection — long-term
  { key: "book", href: "/booking", wide: true, image: "/images/gallery/sk-105.webp" }, // cars in the workshop
] as const;

/**
 * 2×2 asymmetric feature grid. The warranty tile stays tier-neutral —
 * no warranty numeral is allowed here (CLAUDE.md).
 */
export async function FeatureGrid() {
  const t = await getTranslations("home.features");

  return (
    <Section>
      <Container>
        <RevealStagger className="grid gap-4 sm:grid-cols-3">
          {TILES.map((tile) => (
            <RevealItem
              key={tile.key}
              className={cn(tile.wide ? "sm:col-span-2" : "sm:col-span-1")}
            >
              <Link
                href={tile.href}
                className="group relative flex h-full min-h-56 flex-col justify-end overflow-hidden rounded-card border border-ink-700 bg-ink-800 p-6 transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
              >
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes={tile.wide ? "(min-width: 640px) 66vw, 100vw" : "(min-width: 640px) 33vw, 100vw"}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                {/* Scrim — keeps the copy legible over any photo, both themes of light */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-ink-900/15"
                />
                <h3 className="relative font-display text-h3 font-bold text-fg transition-colors group-hover:text-sk-red">
                  {t(`${tile.key}.title`)}
                </h3>
                <p className="relative mt-1 text-small text-fg-muted">
                  {t(`${tile.key}.sub`)}
                </p>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}
