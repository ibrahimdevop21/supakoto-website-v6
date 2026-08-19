"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

export type CarouselItem = {
  id: number;
  name: string;
  branchName: string;
  lang: "ar" | "en";
  rating: number;
  ratingLabel: string;
  text: string;
};

export type CarouselLabels = {
  carousel: string;
  readMore: string;
  close: string;
  prev: string;
  next: string;
  /** "{n} of {total}" — template with {n} and {total} */
  position: string;
};

const AUTOPLAY_MS = 6000;

/**
 * Testimonials carousel (Phase 18, rev. 2).
 * - Native scroll-snap track (touch + trackpad friendly), prev/next buttons.
 * - Every card is the same height: the quote area is fixed at six body
 *   lines (line-clamp-6 + fade); longer reviews get a "read more" that opens
 *   the full text in a modal. Click/tap is the primary action.
 * - Each card renders in the language the CUSTOMER wrote (dir per card,
 *   not per page) — Arabic and English mixed by design.
 * - Keyboard: arrow keys move focus between cards, Enter/Space expands,
 *   Escape closes the modal. Focus returns to the card that opened it.
 * - Autoplay advances every 6s, pauses on hover / focus / touch, stops for
 *   good after the first user interaction, and never runs under
 *   prefers-reduced-motion.
 */
export function TestimonialsCarousel({
  items,
  labels,
}: {
  items: CarouselItem[];
  labels: CarouselLabels;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState<CarouselItem | null>(null);
  const [overflowing, setOverflowing] = useState<Set<number>>(new Set());
  const [autoplay, setAutoplay] = useState(true);
  const [paused, setPaused] = useState(false);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const isRtlPage = () =>
    typeof document !== "undefined" && document.documentElement.dir === "rtl";

  /* ----- which cards actually overflow six lines (so "read more" is honest) ----- */
  useEffect(() => {
    const measure = () => {
      const next = new Set<number>();
      trackRef.current
        ?.querySelectorAll<HTMLElement>("[data-quote]")
        .forEach((el) => {
          if (el.scrollHeight > el.clientHeight + 2) next.add(Number(el.dataset.quote));
        });
      setOverflowing(next);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  /* ----- scrolling helpers ----- */
  const cardWidth = () => {
    const first = trackRef.current?.querySelector<HTMLElement>("li");
    return first ? first.getBoundingClientRect().width + 16 : 320;
  };
  const scrollByCards = useCallback(
    (n: number) => {
      const el = trackRef.current;
      if (!el) return;
      // In RTL the scroll axis is mirrored; "next" is still +1 card visually.
      const dir = isRtlPage() ? -1 : 1;
      el.scrollBy({ left: n * cardWidth() * dir, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce],
  );
  const currentIndex = () => {
    const el = trackRef.current;
    if (!el) return 0;
    const w = cardWidth();
    return Math.round(Math.abs(el.scrollLeft) / w);
  };

  /* ----- autoplay ----- */
  useEffect(() => {
    if (reduce || !autoplay || paused || open) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden) return;
      const atEnd = Math.abs(el.scrollLeft) + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else scrollByCards(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduce, autoplay, paused, open, scrollByCards]);
  const stopAutoplay = () => setAutoplay(false);

  /* ----- keyboard: arrows move between cards, Enter handled by the button ----- */
  const onTrackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    const buttons = cardRefs.current.filter(Boolean) as HTMLButtonElement[];
    const active = buttons.findIndex((b) => b === document.activeElement);
    const start = active >= 0 ? active : currentIndex();
    const forward = isRtlPage() ? e.key === "ArrowLeft" : e.key === "ArrowRight";
    let target = start;
    if (e.key === "Home") target = 0;
    else if (e.key === "End") target = buttons.length - 1;
    else target = Math.max(0, Math.min(buttons.length - 1, start + (forward ? 1 : -1)));
    e.preventDefault();
    stopAutoplay();
    buttons[target]?.focus({ preventScroll: true });
    buttons[target]?.closest("li")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "start", block: "nearest" });
  };

  /* ----- modal ----- */
  const openItem = (item: CarouselItem, from: HTMLElement | null) => {
    restoreFocus.current = from;
    stopAutoplay();
    setOpen(item);
  };
  const close = useCallback(() => {
    setOpen(null);
    const el = restoreFocus.current;
    window.setTimeout(() => el?.focus({ preventScroll: true }), 0);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={stopAutoplay}
      onPointerDown={stopAutoplay}
      onWheel={stopAutoplay}
    >
      <ul
        ref={trackRef}
        role="list"
        aria-label={labels.carousel}
        onKeyDown={onTrackKeyDown}
        className="-mx-(--spacing-gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-(--spacing-gutter) px-(--spacing-gutter) pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => {
          const long = overflowing.has(item.id);
          return (
            <li
              key={item.id}
              className="w-[85vw] shrink-0 snap-start sm:w-[22rem]"
              aria-label={labels.position.replace("{n}", String(i + 1)).replace("{total}", String(items.length))}
            >
              <article className="flex h-full flex-col rounded-card border border-ink-700 bg-ink-800 p-6">
                <Stars value={item.rating} label={item.ratingLabel} />
                {/* Fixed six-line quote area → every card the same height */}
                <button
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={(e) => openItem(item, e.currentTarget)}
                  aria-haspopup="dialog"
                  aria-label={`${labels.readMore} — ${item.name}`}
                  className="group relative mt-4 block w-full cursor-pointer text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sk-red"
                >
                  <blockquote
                    data-quote={item.id}
                    lang={item.lang}
                    dir={item.lang === "ar" ? "rtl" : "ltr"}
                    className="h-[10.2rem] text-fg-muted line-clamp-6 group-hover:text-fg"
                  >
                    <p>{item.text}</p>
                  </blockquote>
                  {long && (
                    <>
                      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink-800 to-transparent" />
                      <span
                        dir={item.lang === "ar" ? "rtl" : "ltr"}
                        className="mt-2 block text-small font-medium text-sk-red underline-offset-4 group-hover:underline"
                      >
                        {labels.readMore}
                      </span>
                    </>
                  )}
                </button>
                {/* Attribution — name, then branch (unchanged) */}
                <figcaption className="mt-auto border-t border-ink-700 pt-4 text-small">
                  <span className="block font-medium text-fg">
                    <bdi>{item.name}</bdi>
                  </span>
                  <span className="block text-fg-subtle">{item.branchName}</span>
                </figcaption>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Prev / next */}
      <div className="mt-2 flex items-center justify-center gap-3">
        <NavButton label={labels.prev} onClick={() => { stopAutoplay(); scrollByCards(-1); }} flip={false} />
        <NavButton label={labels.next} onClick={() => { stopAutoplay(); scrollByCards(1); }} flip />
      </div>

      {/* Full-text modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/80 p-4 sm:items-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`tm-name-${open.id}`}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-card border border-ink-700 bg-ink-800 p-6 sm:p-8"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <Stars value={open.rating} label={open.ratingLabel} />
                <button
                  type="button"
                  onClick={close}
                  autoFocus
                  aria-label={labels.close}
                  className="rounded-card border border-ink-700 px-3 py-1 text-small text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                >
                  {labels.close}
                </button>
              </div>
              <blockquote
                lang={open.lang}
                dir={open.lang === "ar" ? "rtl" : "ltr"}
                className="mt-5 text-fg"
              >
                <p>{open.text}</p>
              </blockquote>
              <p className="mt-6 border-t border-ink-700 pt-4 text-small">
                <span id={`tm-name-${open.id}`} className="block font-medium text-fg">
                  <bdi>{open.name}</bdi>
                </span>
                <span className="block text-fg-subtle">{open.branchName}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ label, onClick, flip }: { label: string; onClick: () => void; flip: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-card border border-ink-700 text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
    >
      {/* Chevron points "back" / "forward" in reading direction — rtl:-scale-x-100 mirrors for Arabic */}
      <svg viewBox="0 0 16 16" className={cn("size-4 rtl:-scale-x-100", flip && "-scale-x-100 rtl:scale-x-100")} aria-hidden>
        <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>
  );
}

export function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className="inline-flex items-center gap-0.5 text-star"
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
