import { cn } from "@/lib/cn";

/**
 * Small section label with the red rule. Tracking + uppercase apply to Latin
 * only — the RTL base-layer guard neutralises both under [dir="rtl"].
 */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "mb-4 flex items-center gap-3 text-eyebrow font-medium uppercase tracking-(--text-eyebrow--letter-spacing) text-fg-muted",
        className,
      )}
    >
      <span aria-hidden className="inline-block h-px w-8 bg-sk-red" />
      {children}
    </p>
  );
}
