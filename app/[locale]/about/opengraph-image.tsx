import { getTranslations } from "next-intl/server";
import { brandOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const t = await getTranslations({ locale: "en", namespace: "about" });
  return brandOg(t("title"));
}
