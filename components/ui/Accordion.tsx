"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

export type AccordionItemData = {
  id: string;
  question: React.ReactNode;
  answer: React.ReactNode;
};

export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className={cn("divide-y divide-ink-700 border-y border-ink-700", className)}>
      {items.map((item) => (
        <AccordionRow
          key={item.id}
          item={item}
          open={open === item.id}
          onToggle={() =>
            setOpen((current) => (current === item.id ? null : item.id))
          }
        />
      ))}
    </div>
  );
}

function AccordionRow({
  item,
  open,
  onToggle,
}: {
  item: AccordionItemData;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const headingId = useId();
  const panelId = useId();

  return (
    <div>
      <h3>
        <button
          id={headingId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-start text-body font-medium text-fg transition-colors hover:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
        >
          {item.question}
          <motion.svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-4 shrink-0 text-fg-subtle"
            animate={{ rotate: open ? 180 : 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
          >
            <path
              d="M3 6l5 5 5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </motion.svg>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-fg-muted">{item.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
