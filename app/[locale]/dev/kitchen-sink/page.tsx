import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { Accordion } from "@/components/ui/Accordion";
import {
  Label,
  Input,
  Textarea,
  Select,
  FieldError,
  PhoneInput,
} from "@/components/ui/Field";
import { LightboxDemo } from "@/components/dev/LightboxDemo";

export default async function KitchenSinkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dev.kitchenSink");

  const accordionItems = [1, 2, 3].map((n) => ({
    id: `q${n}`,
    question: t(`accordionQ${n}`),
    answer: t(`accordionA${n}`),
  }));

  const mirrorDir = locale === "ar" ? "ltr" : "rtl";

  return (
    <main className="pt-18">
      <Section>
        <Container className="space-y-16">
          <header>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <Heading level={1}>{t("title")}</Heading>
            <p className="mt-4 max-w-prose text-fg-muted">{t("intro")}</p>
          </header>

          {/* Type */}
          <div className="space-y-4">
            <Heading level={2}>{t("typeHeading")}</Heading>
            <Heading level={1}>{t("h1")}</Heading>
            <Heading level={2}>{t("h2")}</Heading>
            <Heading level={3}>{t("h3")}</Heading>
            <p className="max-w-prose">{t("bodyText")}</p>
            <p className="text-small text-fg-muted">{t("bodyText")}</p>
          </div>

          {/* Buttons */}
          <div className="space-y-4">
            <Heading level={2}>{t("buttonsHeading")}</Heading>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary">{t("buttonPrimary")}</Button>
              <Button variant="ghost">{t("buttonGhost")}</Button>
              <Button variant="link">{t("buttonLink")}</Button>
              <Button variant="primary" disabled>
                {t("buttonDisabled")}
              </Button>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <Heading level={2}>{t("cardsHeading")}</Heading>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <Heading level={3}>{t("cardTitle")}</Heading>
                <p className="mt-2 text-fg-muted">{t("cardBody")}</p>
              </Card>
              <Card lift>
                <Heading level={3}>{t("cardLiftTitle")}</Heading>
                <p className="mt-2 text-fg-muted">{t("cardLiftBody")}</p>
              </Card>
            </div>
          </div>

          {/* Motion */}
          <div className="space-y-4">
            <Heading level={2}>{t("motionHeading")}</Heading>
            <Reveal>
              <Card>{t("motionSingle")}</Card>
            </Reveal>
            <RevealStagger className="grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <RevealItem key={n}>
                  <Card>
                    {t("motionStagger")} {n}
                  </Card>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>

          {/* Counters */}
          <div className="space-y-4">
            <Heading level={2}>{t("countersHeading")}</Heading>
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <Counter value={6} className="text-h1" />
                <p className="mt-1 text-fg-muted">{t("counterBranches")}</p>
              </div>
              <div>
                <Counter value={4800} suffix="+" className="text-h1" />
                <p className="mt-1 text-fg-muted">{t("counterCars")}</p>
              </div>
              <div>
                <Counter value={9} className="text-h1" />
                <p className="mt-1 text-fg-muted">{t("counterYears")}</p>
              </div>
            </div>
          </div>

          {/* Accordion */}
          <div className="space-y-4">
            <Heading level={2}>{t("accordionHeading")}</Heading>
            <Accordion items={accordionItems} />
          </div>

          {/* Lightbox */}
          <div className="space-y-4">
            <Heading level={2}>{t("lightboxHeading")}</Heading>
            <LightboxDemo
              labels={{
                open: t("lightboxOpen"),
                close: t("lightboxClose"),
                prev: t("lightboxPrev"),
                next: t("lightboxNext"),
                caption: t("lightboxCaption"),
              }}
            />
          </div>
        </Container>
      </Section>

      {/* Form set on the light surface it will actually be used on */}
      <Section tone="paper">
        <Container className="space-y-8">
          <Heading level={2}>{t("formHeading")}</Heading>
          <form className="grid max-w-2xl gap-6" action="#">
            <div>
              <Label htmlFor="ks-name">{t("formName")}</Label>
              <Input id="ks-name" placeholder={t("formNamePlaceholder")} />
            </div>
            <div>
              <Label htmlFor="ks-phone">{t("formPhone")}</Label>
              {/* Placeholder is deliberately non-numeric — the build guard
                  bans phone literals outside content/. */}
              <PhoneInput id="ks-phone" placeholder="01x xxxx xxxx" />
            </div>
            <div>
              <Label htmlFor="ks-email">{t("formEmail")}</Label>
              <Input
                id="ks-email"
                type="email"
                aria-invalid="true"
                placeholder="name@example.com"
              />
              <FieldError>{t("formError")}</FieldError>
            </div>
            <div>
              <Label htmlFor="ks-subject">{t("formSubject")}</Label>
              <Select id="ks-subject" defaultValue="booking">
                <option value="booking">{t("formSubjectBooking")}</option>
                <option value="complaint">{t("formSubjectComplaint")}</option>
                <option value="other">{t("formSubjectOther")}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ks-message">{t("formMessage")}</Label>
              <Textarea
                id="ks-message"
                placeholder={t("formMessagePlaceholder")}
              />
            </div>
            <Button variant="primary" type="submit" className="justify-self-start">
              {t("formSubmit")}
            </Button>
          </form>
        </Container>
      </Section>

      {/* Opposite direction strip */}
      <Section tone="raised">
        <Container className="space-y-8">
          <Heading level={2}>{t("mirrorHeading")}</Heading>
          <p className="max-w-prose text-fg-muted">{t("mirrorNote")}</p>
          <div
            dir={mirrorDir}
            className="space-y-6 rounded-card border border-ink-700 p-6"
          >
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <Heading level={3}>{t("h3")}</Heading>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">{t("buttonPrimary")}</Button>
              <Button variant="ghost">{t("buttonGhost")}</Button>
            </div>
            <Accordion
              items={accordionItems.map((i) => ({ ...i, id: `m-${i.id}` }))}
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
