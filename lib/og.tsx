import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared brand OG card: the homepage hero photo (s1, pre-cropped to
 * 1200×630 as assets/og/hero-bg.jpg — satori can't decode webp and the
 * original is 2000×1500) under a dark scrim, title on top, logo small in
 * the corner. Titles are English for both locales: satori has no Arabic
 * contextual shaping, so Arabic titles would render disjointed.
 *
 * Bundling: these files are read with fs at request time, so Vercel's
 * output tracing must be told about them — next.config.ts
 * `outputFileTracingIncludes` covers assets/og/** and the logo for every
 * opengraph-image route. Missing that is exactly the ENOENT 500 storm of
 * 2026-08-22; the fallback chain below means even a bundling regression
 * can never 500 this route again.
 */

type OgAssets = { font: Buffer; logoSrc: string; heroSrc: string };
let cached: OgAssets | null = null;

async function loadAssets(): Promise<OgAssets> {
  if (cached) return cached;
  const [font, logo, hero] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/og/RH-Zak-Bold.ttf")),
    readFile(path.join(process.cwd(), "public/brand/logo-white.png")),
    readFile(path.join(process.cwd(), "assets/og/hero-bg.jpg")),
  ]);
  cached = {
    font,
    logoSrc: `data:image/png;base64,${logo.toString("base64")}`,
    heroSrc: `data:image/jpeg;base64,${hero.toString("base64")}`,
  };
  return cached;
}

/** 1×1 dark PNG — the never-fails last resort (still a valid 200 image). */
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADgQF/e5IkGQAAAABJRU5ErkJggg==",
  "base64",
);

export async function brandOg(title: string) {
  // Tier 1: the full card (custom font, hero background, logo).
  try {
    const { font, logoSrc, heroSrc } = await loadAssets();
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            fontFamily: "RH-Zak",
            color: "#f5f5f4",
            backgroundColor: "#0a0a0b",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroSrc}
            width={1200}
            height={630}
            alt=""
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
          {/* Scrim — darkest where the title sits; the text is the point. */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(to top, rgba(10,10,11,0.92) 0%, rgba(10,10,11,0.55) 45%, rgba(10,10,11,0.30) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 64,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={190} height={85} alt="" style={{ alignSelf: "flex-start" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ width: 96, height: 6, backgroundColor: "#bf1e2e" }} />
              <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
            </div>
          </div>
        </div>
      ),
      { ...OG_SIZE, fonts: [{ name: "RH-Zak", data: font, weight: 700, style: "normal" }] },
    );
  } catch (err) {
    console.error("[og] full card failed, serving system-font fallback:", err);
  }

  // Tier 2: plain dark card, satori's built-in font, no file reads.
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 72,
            backgroundColor: "#0a0a0b",
            color: "#f5f5f4",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ width: 96, height: 6, backgroundColor: "#bf1e2e" }} />
            <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          </div>
        </div>
      ),
      OG_SIZE,
    );
  } catch (err) {
    console.error("[og] fallback card failed, serving pixel:", err);
    return new Response(PIXEL_PNG, { headers: { "Content-Type": "image/png" } });
  }
}
