import type { RegionId } from "./regions";

/**
 * Location options for the building heat isolation quote form.
 * Display names live in messages under buildingQuote.{governorates,emirates}.
 * The selected region decides which WhatsApp line receives the quote request
 * (content/regions.ts) — overriding the global RegionPicker, since the
 * property's location beats the browsing region.
 */

export const governorates = [
  "cairo",
  "giza",
  "alexandria",
  "qalyubia",
  "dakahlia",
  "sharqia",
  "gharbia",
  "monufia",
  "beheira",
  "kafr-el-sheikh",
  "damietta",
  "port-said",
  "ismailia",
  "suez",
  "north-sinai",
  "south-sinai",
  "red-sea",
  "faiyum",
  "beni-suef",
  "minya",
  "asyut",
  "sohag",
  "qena",
  "luxor",
  "aswan",
  "new-valley",
  "matrouh",
] as const;

export const emirates = [
  "abu-dhabi",
  "dubai",
  "sharjah",
  "ajman",
  "umm-al-quwain",
  "ras-al-khaimah",
  "fujairah",
] as const;

export type Governorate = (typeof governorates)[number];
export type Emirate = (typeof emirates)[number];

export function areasForRegion(region: RegionId): readonly string[] {
  return region === "egypt" ? governorates : emirates;
}
