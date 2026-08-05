import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const TILES = [
  { key: "branches", href: "/branches", wide: true },
  { key: "takai", href: "/services/ppf", wide: false },
  { key: "warranty", href: "/warranty", wide: false },
  { key: "book", href: "/booking", wide: true },
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
                className="group flex h-full min-h-44 flex-col justify-end rounded-card border border-ink-700 bg-ink-800 p-6 transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
              >
                <h3 className="font-display text-h3 font-bold text-fg transition-colors group-hover:text-sk-red">
                  {t(`${tile.key}.title`)}
                </h3>
                <p className="mt-1 text-small text-fg-muted">
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
