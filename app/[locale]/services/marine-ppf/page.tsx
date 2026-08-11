import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/metadata";
import { PendingServiceDetail } from "@/components/sections/services/PendingServiceDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "services.items.marine-ppf",
  });
  return pageMetadata({
    locale,
    path: "/services/marine-ppf",
    title: t("seoTitle"),
    description: t("seoDescription"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PendingServiceDetail serviceId="marine-ppf" />;
}
