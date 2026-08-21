import { cn } from "@/lib/cn";

/** Selectable card button shared by the wizard, the building fieldsets and the quote page. */
export const choiceClass = (selected: boolean) =>
  cn(
    "rounded-card border px-4 py-3 text-start text-body font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
    selected
      ? "border-sk-red bg-sk-red-muted text-fg"
      : "border-ink-700 bg-ink-800 text-fg-muted hover:border-fg-subtle hover:text-fg",
  );
