import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";

/** Inner-page opener. Clears the fixed header (4.5rem) with its own padding. */
export function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="pt-18">
      <section className="border-b border-ink-700 py-(--spacing-section)">
        <Container>
          <Reveal>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Heading level={1}>{title}</Heading>
            {sub && <p className="mt-4 max-w-2xl text-fg-muted">{sub}</p>}
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
