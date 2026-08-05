import { cn } from "@/lib/cn";

/**
 * Clearly-labelled placeholder media block. Every instance renders the
 * pending-asset note so nothing placeholder can ship unnoticed.
 * See docs/progress/ASSETS-NEEDED.md.
 */
export function Placeholder({
  note,
  className,
  children,
}: {
  note: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-card border border-ink-700 bg-[linear-gradient(135deg,var(--color-ink-800),var(--color-ink-900))]",
        className,
      )}
    >
      {children}
      <span className="absolute bottom-2 start-2 rounded-card bg-ink-950/80 px-2 py-1 text-eyebrow text-fg-subtle">
        {note}
      </span>
    </div>
  );
}
