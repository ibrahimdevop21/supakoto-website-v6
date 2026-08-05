import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { rhZak, plexArabic, inter } from "@/app/fonts";
import { RegionProvider } from "@/components/providers/RegionProvider";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { WhatsAppFab } from "@/components/chrome/WhatsAppFab";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SupaKoto",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${rhZak.variable} ${plexArabic.variable} ${inter.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <RegionProvider>
            <Header />
            {children}
            <Footer />
            <WhatsAppFab />
          </RegionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
