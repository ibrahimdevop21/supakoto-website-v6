"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

/**
 * Controlled media lightbox. Keyboard: Esc closes, arrows navigate.
 * Arrow keys are physical (left/right), mapped to prev/next by direction
 * so navigation feels native in RTL.
 */
export function Lightbox({
  open,
  onClose,
  onPrev,
  onNext,
  labels,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  labels: { close: string; prev: string; next: string };
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") (rtl ? onNext : onPrev)?.();
      if (e.key === "ArrowRight") (rtl ? onPrev : onNext)?.();
    },
    [onClose, onPrev, onNext],
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [open, handleKey]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={reduce ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="relative max-h-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="absolute top-4 end-4 rounded-card border border-ink-700 bg-ink-900 p-2 text-fg hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="size-5">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          {onPrev && (
            <NavArrow side="start" label={labels.prev} onClick={onPrev} />
          )}
          {onNext && (
            <NavArrow side="end" label={labels.next} onClick={onNext} />
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function NavArrow({
  side,
  label,
  onClick,
}: {
  side: "start" | "end";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={
        (side === "start" ? "start-4" : "end-4") +
        " absolute top-1/2 -translate-y-1/2 rounded-card border border-ink-700 bg-ink-900 p-2 text-fg hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
      }
    >
      {/* Chevron implies direction — mirrors with dir via CSS logical rotation */}
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className={
          "size-5 " + (side === "start" ? "rtl:rotate-180" : "ltr:rotate-180")
        }
      >
        <path
          d="M10 3L5 8l5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
}
