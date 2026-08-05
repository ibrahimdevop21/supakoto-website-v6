"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRegion } from "@/components/providers/RegionProvider";
import { EASE_OUT } from "@/lib/motion";
import type { RegionId } from "@/content/regions";
import { CloseIcon } from "@/components/icons";

/**
 * Region stays a modal (not a nav dropdown) — UX contract from the spec.
 * Rebuilt fresh; V5 source is off-limits.
 */
export function RegionPicker({ className }: { className?: string }) {
  const t = useTranslations("chrome.region");
  const { region, setRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const choose = (id: RegionId) => {
    setRegion(id);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={
          "rounded-card border border-ink-700 px-3 py-1.5 text-small font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red " +
          (className ?? "")
        }
      >
        {t(region.id)}
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={t("title")}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 p-4"
                onClick={() => setOpen(false)}
              >
                <motion.div
                  initial={reduce ? false : { y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: 16, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                  className="w-full max-w-sm rounded-card border border-ink-700 bg-ink-900 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-1 flex items-start justify-between gap-4">
                    <h2 className="text-h3 font-medium">{t("title")}</h2>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={t("close")}
                      className="rounded-card p-1 text-fg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                    >
                      <CloseIcon className="size-5" />
                    </button>
                  </div>
                  <p className="mb-5 text-small text-fg-muted">{t("note")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["egypt", "uae"] as const).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => choose(id)}
                        aria-pressed={region.id === id}
                        className={
                          "rounded-card border px-4 py-4 text-body font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red " +
                          (region.id === id
                            ? "border-sk-red bg-sk-red-muted text-fg"
                            : "border-ink-700 bg-ink-800 text-fg-muted hover:border-fg-subtle hover:text-fg")
                        }
                      >
                        {t(id)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
