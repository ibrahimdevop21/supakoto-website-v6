import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-dvh items-center pt-18">
      <Container className="py-24 text-center">
        <Heading level={1}>{t("title")}</Heading>
        <p className="mx-auto mt-4 max-w-md text-fg-muted">{t("sub")}</p>
        <Button href="/" className="mt-8">
          {t("cta")}
        </Button>
      </Container>
    </main>
  );
}
