import { cn } from "@/lib/cn";

type Level = 1 | 2 | 3;

const styles: Record<Level, string> = {
  1: "font-display text-h1 font-bold",
  2: "font-display text-h2 font-bold",
  3: "text-h3 font-medium",
};

export function Heading({
  level,
  className,
  children,
  id,
}: {
  level: Level;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className={cn(styles[level], "text-balance", className)}>
      {children}
    </Tag>
  );
}
