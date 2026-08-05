import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm, ContactInfo } from "@/components/forms/ContactForm";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <main>
      <PageHero title={t("title")} sub={t("sub")} />
      <Section>
        <Container className="space-y-14">
          <Reveal>
            <ContactInfo />
          </Reveal>
          <Reveal>
            <Heading level={2}>{t("formHeading")}</Heading>
            <div className="mt-8">
              <ContactForm />
            </div>
          </Reveal>
        </Container>
      </Section>
    </main>
  );
}
