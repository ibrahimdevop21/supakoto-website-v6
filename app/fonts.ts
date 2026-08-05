import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import localFont from "next/font/local";

export const rhZak = localFont({
  // Bold only — every display-font use on the site is weight 700.
  // Thin/Regular stay in app/fonts/ for when a lighter cut is needed.
  src: [{ path: "./fonts/RH-Zak-Bold.woff2", weight: "700", style: "normal" }],
  variable: "--font-rh-zak",
  // "optional": a late-arriving display font must not repaint the hero H1
  // (it is the LCP element). Cached visits render RH-Zak immediately.
  // No preload for the same reason — an optional font stays off the
  // render-critical chain entirely.
  display: "optional",
  preload: false,
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
