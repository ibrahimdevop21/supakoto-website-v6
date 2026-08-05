import { getTranslations } from "next-intl/server";
import { galleryItems } from "@/content/gallery";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Placeholder } from "@/components/ui/Placeholder";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";

/** 3-across preview pulling 9 items from the gallery. */
export async function WorkPreview() {
  const t = await getTranslations("home.ourWork");
  const tGallery = await getTranslations("gallery");
  const items = galleryItems.filter((i) => i.category !== "video").slice(0, 9);

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
              <Placeholder
                note={tGallery("placeholderNote")}
                className="aspect-square"
              />
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}
