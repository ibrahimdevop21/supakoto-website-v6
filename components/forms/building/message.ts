import type { RegionId } from "@/content/regions";
import { cap, type BuildingDetails } from "./types";

type T = (key: string) => string;

/**
 * The WhatsApp body for a building quote — ONE builder for both entry
 * points (standalone page and wizard), so whoever triages the inbox sees
 * the identical message. Quote marker first, ref on its own labelled
 * line (Phase 18 item 6), measurements immediately after: it must never
 * read like a car booking.
 */
export function buildingQuoteLines({
  t,
  tChrome,
  details,
  region,
  ref,
  name,
  phone,
  whatsapp,
}: {
  /** `useTranslations("buildingQuote")` */
  t: T;
  /** `useTranslations("chrome.region")` */
  tChrome: T;
  details: BuildingDetails;
  region: RegionId;
  ref: string | null;
  name: string;
  phone: string;
  whatsapp?: string;
}): string[] {
  const areaKind = region === "egypt" ? "governorates" : "emirates";
  return [
    t("wa.title"),
    ...(ref ? [`${t("wa.ref")}: ${ref}`] : []),
    ...(details.measureMode === "area"
      ? [`${t("wa.area")}: ${details.glazingArea} m²`]
      : [
          `${t("wa.windows")}: ${details.windowCount}`,
          `${t("wa.dims")}: ${details.windowDims}`,
        ]),
    `${t("wa.floors")}: ${details.floors}`,
    `${t("wa.glass")}: ${t(`fields.glass${cap(details.glassType)}`)}`,
    `${t("wa.property")}: ${t(
      details.propertyType === "commercial" ? "fields.propertyCommercial" : "fields.propertyResidential",
    )}`,
    `${t("wa.location")}: ${details.area ? t(`${areaKind}.${details.area}`) : ""} — ${tChrome(region)}`,
    `${t("wa.problem")}: ${details.problem ? t(`fields.problem${cap(details.problem)}`) : ""}`,
    `${t("wa.name")}: ${name}`,
    `${t("wa.phone")}: ${phone}`,
    `${t("wa.whatsapp")}: ${whatsapp || phone}`,
  ];
}
