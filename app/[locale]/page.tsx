import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="font-display text-h1">{t("title")}</h1>
    </main>
  );
}
