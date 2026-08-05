import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import localFont from "next/font/local";

export const rhZak = localFont({
  src: [
    { path: "./fonts/RH-Zak-Thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/RH-Zak-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RH-Zak-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-rh-zak",
  display: "swap",
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-plex-ar",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
