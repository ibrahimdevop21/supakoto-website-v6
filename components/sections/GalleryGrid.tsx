"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  galleryCategories,
  galleryItems,
  type GalleryCategory,
} from "@/content/gallery";
import { Placeholder } from "@/components/ui/Placeholder";
import { Lightbox } from "@/components/ui/Lightbox";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const ASPECTS = {
  square: "aspect-square",
  portrait: "aspect-3/4",
  landscape: "aspect-4/3",
} as const;

export function GalleryGrid() {
  const t = useTranslations("gallery");
  const tServices = useTranslations("services.items");
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((i) => i.category === filter);

  const filterLabel = (c: GalleryCategory | "all") =>
    c === "all" || c === "video" ? t(`filters.${c}`) : tServices(`${c}.name`);

  const step = (delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + delta + filtered.length) % filtered.length;
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2" role="group">
        {galleryCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={cn(
              "rounded-card border px-4 py-2 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
              filter === c
                ? "border-sk-red bg-sk-red-muted text-fg"
                : "border-ink-700 text-fg-muted hover:border-fg-subtle hover:text-fg",
            )}
          >
            {filterLabel(c)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <RevealStagger
        key={filter}
        className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3"
      >
        {filtered.map((item, i) => (
          <RevealItem key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
              aria-label={`${filterLabel(item.category)} ${i + 1}`}
            >
              <Placeholder
                note={t("placeholderNote")}
                className={cn(ASPECTS[item.aspect], "w-full transition-colors hover:border-fg-subtle")}
              >
                <span className="text-eyebrow uppercase text-fg-subtle">
                  {filterLabel(item.category)}
                </span>
              </Placeholder>
            </button>
          </RevealItem>
        ))}
      </RevealStagger>

      {/* Lightbox */}
      <Lightbox
        open={openIndex !== null}
        onClose={() => setOpenIndex(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        labels={{
          close: t("lightbox.close"),
          prev: t("lightbox.prev"),
          next: t("lightbox.next"),
        }}
      >
        {openIndex !== null && filtered[openIndex] && (
          <figure className="rounded-card border border-ink-700 bg-ink-900 p-2">
            <Placeholder
              note={t("placeholderNote")}
              className="flex aspect-video w-[70vw] max-w-3xl"
            >
              <span className="text-h3 text-fg-subtle">
                {filterLabel(filtered[openIndex].category)}
              </span>
            </Placeholder>
            <figcaption className="p-3 text-small text-fg-muted" dir="ltr">
              {openIndex + 1}/{filtered.length}
            </figcaption>
          </figure>
        )}
      </Lightbox>
    </div>
  );
}
