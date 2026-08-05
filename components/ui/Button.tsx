import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type Variant = "primary" | "ghost" | "link";

const base =
  "inline-flex items-center justify-center gap-2 text-body font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "rounded-card bg-sk-red px-6 py-3 text-fg hover:bg-sk-red-hover",
  ghost:
    "rounded-card border border-ink-700 px-6 py-3 text-fg hover:border-fg-subtle hover:bg-ink-800",
  link: "text-sk-red underline-offset-4 hover:underline",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

type AsLink = CommonProps & { href: ComponentProps<typeof Link>["href"] };
type AsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Button(props: AsLink | AsButton) {
  if ("href" in props) {
    const { variant = "primary", className, children, href } = props;
    return (
      <Link href={href} className={cn(base, variants[variant], className)}>
        {children}
      </Link>
    );
  }
  const { variant = "primary", className, children, type, ...rest } = props;
  return (
    <button
      type={type ?? "button"}
      className={cn(base, variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
