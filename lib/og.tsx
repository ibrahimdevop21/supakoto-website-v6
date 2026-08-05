import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared brand OG card. Titles are English for both locales: satori has no
 * Arabic contextual shaping, so Arabic titles would render disjointed.
 * Revisit if satori gains complex-script support.
 */
export async function brandOg(title: string) {
  const [font, logo] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/og/RH-Zak-Bold.ttf")),
    readFile(path.join(process.cwd(), "public/brand/logo-white.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#0a0a0b",
          color: "#f5f5f4",
          fontFamily: "RH-Zak",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={300} height={129} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 96, height: 6, backgroundColor: "#bf1e2e" }} />
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "RH-Zak", data: font, weight: 700, style: "normal" }],
    },
  );
}
