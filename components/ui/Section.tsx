import { cn } from "@/lib/cn";

/**
 * Vertical rhythm wrapper. `tone="paper"` flips to the light surface —
 * used sparingly (spec tables, forms).
 */
export function Section({
  tone = "dark",
  className,
  children,
  ...rest
}: {
  tone?: "dark" | "raised" | "paper";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "py-(--spacing-section)",
        tone === "raised" && "bg-ink-900",
        tone === "paper" && "bg-paper text-paper-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
