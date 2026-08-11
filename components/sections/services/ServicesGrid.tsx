import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { services } from "@/content/services";
import { serviceImage } from "@/content/gallery";
import { Link } from "@/i18n/navigation";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * The one services layout, used by both the homepage section and the
 * /services index (Ibrahim 2026-08-11: "7 cards should behave the same
 * in both places"). Responsive wrapping grid, max 4 per row:
 * 1 column / sm 2 / lg 3 / 2xl 4. Equal-height cards, no horizontal
 * overflow. Non-vehicle substrates read differently on purpose —
 * red-tinted border, substrate named in the benefit line.
 */
export async function ServicesGrid() {
  const tItems = await getTranslations("services.items");

  return (
    <RevealStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {services.map((s) => (
        <RevealItem key={s.id} className="h-full">
          <Link
            href={`/services/${s.slug}`}
            className={cn(
              "group flex h-full flex-col overflow-hidden rounded-card border bg-ink-800 transition-colors",
              s.substrate === "vehicle"
                ? "border-ink-700 hover:border-fg-subtle"
                : "border-sk-red/40 hover:border-sk-red",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
            )}
          >
            <div className="relative aspect-4/3 overflow-hidden">
              <Image
                src={serviceImage(s.id)}
                alt={tItems(`${s.id}.imageAlt`)}
                fill
                sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-h3 font-medium text-fg transition-colors group-hover:text-sk-red">
                {tItems(`${s.id}.name`)}
              </h3>
              <p className="mt-1 text-small text-fg-muted">
                {tItems(`${s.id}.benefit`)}
              </p>
            </div>
          </Link>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
