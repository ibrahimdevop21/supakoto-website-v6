import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { galleryItems } from "@/content/gallery";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";

/** 3-across preview pulling 9 items from the gallery. */
export async function WorkPreview() {
  const t = await getTranslations("home.ourWork");
  const tGallery = await getTranslations("gallery");
  const items = galleryItems.filter((i) => i.kind === "image").slice(0, 9);

  return (
    <Section tone="raised">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <Heading level={2}>{t("title")}</Heading>
            <p className="mt-2 text-fg-muted">{t("sub")}</p>
          </div>
          <Button variant="ghost" href="/gallery">
            {t("cta")}
          </Button>
        </Reveal>
        <RevealStagger className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <RevealItem key={item.id}>
              <Link
                href="/gallery"
                className="relative block aspect-square overflow-hidden rounded-card border border-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
              >
                <Image
                  src={item.src}
                  alt={tGallery(`items.${item.id}.alt`)}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}
