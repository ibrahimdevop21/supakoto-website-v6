/**
 * TAKAI PPF product data — supplied by Ibrahim, 2026-08-06. Verbatim specs;
 * do not edit values without a new ops sheet.
 *
 * Regional split (Ibrahim, same date): Signature line is the UAE offering,
 * Performance line is the Egypt offering, and TAKAI PREMIUM PLUS is sold
 * in BOTH regions (added to the Performance list with its Signature specs).
 *
 * NOTE: this dataset contains NO warranty terms. Warranty stays tier-scoped
 * in content/warranty.ts — never derive warranty claims from this file.
 */

import type { RegionId } from "./regions";

export type TakaiProduct = {
  name: string;
  totalThickness: string;
  tpuFilm: string;
  /** null = matte (no gloss value). */
  gloss: string | null;
  /** Egypt: matte finish offered at this level (Ibrahim, 2026-08-06). */
  matteAvailable?: boolean;
  selfHealingCoating: string;
  adhesiveLayer: string;
  elongationAtBreak: string;
  tensileStrength: string;
  antiYellowing: string;
  hydrophobic: string;
};

export type TakaiLine = {
  id: "signature" | "performance";
  region: RegionId;
  products: TakaiProduct[];
};

const common = {
  selfHealingCoating: "15 μm",
  adhesiveLayer: "25 μm",
  antiYellowing: "ΔE < 1",
  hydrophobic: "R9–R10",
};

export const takaiLines: TakaiLine[] = [
  {
    id: "signature",
    region: "uae",
    products: [
      { name: "TAKAI 5", totalThickness: "170 μm", tpuFilm: "130 μm", gloss: "92", elongationAtBreak: "≥ 350%", tensileStrength: "30 MPa", ...common },
      { name: "TAKAI MATT", totalThickness: "190 μm", tpuFilm: "150 μm", gloss: null, elongationAtBreak: "≥ 400%", tensileStrength: "35 MPa", ...common },
      { name: "TAKAI MATT PLUS", totalThickness: "240 μm", tpuFilm: "200 μm", gloss: null, elongationAtBreak: "≥ 400%", tensileStrength: "38 MPa", ...common },
      { name: "TAKAI Colours", totalThickness: "240 μm", tpuFilm: "200 μm", gloss: "93.8", elongationAtBreak: "≥ 400%", tensileStrength: "35 MPa", ...common },
      { name: "TAKAI ULTIMATE GLOSS", totalThickness: "240 μm", tpuFilm: "200 μm", gloss: "93.8", elongationAtBreak: "≥ 400%", tensileStrength: "38 MPa", ...common },
      { name: "TAKAI STEELPLUS", totalThickness: "240 μm", tpuFilm: "200 μm", gloss: "94.5", elongationAtBreak: "≥ 400%", tensileStrength: "38 MPa", ...common },
      { name: "TAKAI PREMIUM PLUS", totalThickness: "240 μm", tpuFilm: "200 μm", gloss: "95.4", elongationAtBreak: "≥ 450%", tensileStrength: "40 MPa", ...common },
    ],
  },
  {
    id: "performance",
    region: "egypt",
    products: [
      { name: "TAKAI 5", totalThickness: "170 μm", tpuFilm: "130 μm", gloss: "92", elongationAtBreak: "≥ 350%", tensileStrength: "30 MPa", ...common },
      { name: "TAKAI GOLD", totalThickness: "210 μm", tpuFilm: "180 μm", gloss: "92.4", elongationAtBreak: "≥ 400%", tensileStrength: "32 MPa", ...common },
      { name: "TAKAI GOLD PLUS", totalThickness: "250 μm", tpuFilm: "220 μm", gloss: "93.8", elongationAtBreak: "≥ 400%", tensileStrength: "35 MPa", matteAvailable: true, ...common },
      { name: "TAKAI STEEL", totalThickness: "270 μm", tpuFilm: "240 μm", gloss: "95.2", elongationAtBreak: "≥ 400%", tensileStrength: "40 MPa", ...common },
      { name: "TAKAI STEEL PLUS", totalThickness: "270 μm", tpuFilm: "240 μm", gloss: "96.2", elongationAtBreak: "≥ 350%", tensileStrength: "45 MPa", matteAvailable: true, ...common },
      // Premium Plus is sold in both regions (Ibrahim, 2026-08-06).
      { name: "TAKAI PREMIUM PLUS", totalThickness: "240 μm", tpuFilm: "200 μm", gloss: "95.4", elongationAtBreak: "≥ 450%", tensileStrength: "40 MPa", ...common },
    ],
  },
];

export function takaiLineForRegion(region: RegionId): TakaiLine {
  return takaiLines.find((l) => l.region === region) ?? takaiLines[0];
}

export const TAKAI_COLUMNS = [
  "totalThickness",
  "tpuFilm",
  "gloss",
  "selfHealingCoating",
  "adhesiveLayer",
  "elongationAtBreak",
  "tensileStrength",
  "antiYellowing",
  "hydrophobic",
] as const;

export type TakaiColumn = (typeof TAKAI_COLUMNS)[number];
