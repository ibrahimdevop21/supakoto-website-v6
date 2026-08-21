/**
 * Building heat-isolation quote — the measurement questions, shared by
 * the standalone /services/building-heat-isolation/quote page (stacked in
 * one form) and the booking wizard's building flow (one screen each).
 * Region and contact details live with the caller; this is only what a
 * quote needs that a car booking never asks.
 */
export type MeasureMode = "area" | "windows";

export type BuildingDetails = {
  propertyType: "residential" | "commercial" | "";
  /** Governorate or emirate id (content/buildingQuote.ts). */
  area: string;
  measureMode: MeasureMode;
  glazingArea: string;
  windowCount: string;
  windowDims: string;
  floors: string;
  glassType: "clear" | "tinted" | "double" | "unknown";
  problem: "heat" | "glare" | "bills" | "fading" | "";
};

export const emptyBuildingDetails: BuildingDetails = {
  propertyType: "",
  area: "",
  measureMode: "area",
  glazingArea: "",
  windowCount: "",
  windowDims: "",
  floors: "",
  glassType: "unknown",
  problem: "",
};

export const propertyOk = (d: BuildingDetails) => !!d.propertyType;
export const locationOk = (d: BuildingDetails) => !!d.area;
export const measurementsOk = (d: BuildingDetails) =>
  (d.measureMode === "area"
    ? d.glazingArea.trim().length > 0
    : d.windowCount.trim().length > 0 && d.windowDims.trim().length > 0) &&
  d.floors.trim().length > 0;
export const problemOk = (d: BuildingDetails) => !!d.problem;
export const buildingDetailsOk = (d: BuildingDetails) =>
  propertyOk(d) && locationOk(d) && measurementsOk(d) && problemOk(d);

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
