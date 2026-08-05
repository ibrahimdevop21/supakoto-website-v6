import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBand({
  title,
  sub,
  buttonLabel,
  href,
}: {
  title: string;
  sub?: string;
  buttonLabel: string;
  href: string;
}) {
  return (
    <section className="border-y border-ink-700 bg-ink-900 py-(--spacing-section)">
      <Container>
        <Reveal className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level={2}>{title}</Heading>
            {sub && <p className="mt-2 text-fg-muted">{sub}</p>}
          </div>
          <Button href={href}>{buttonLabel}</Button>
        </Reveal>
      </Container>
    </section>
  );
}
