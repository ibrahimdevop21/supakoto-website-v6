import { getTranslations } from "next-intl/server";
import { getService } from "@/content/services";
import { brandOg, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Per-service OG card (English title — satori has no Arabic shaping; see lib/og). */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  const t = await getTranslations({ locale: "en", namespace: "services.items" });
  return brandOg(service ? t(`${service.id}.name`) : "SupaKoto");
}
