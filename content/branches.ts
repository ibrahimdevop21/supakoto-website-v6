import type { RegionId } from "./regions";

export type Branch = {
  /** Also the message key: branches.items.<id>.{name,address} */
  id: string;
  region: RegionId;
  /**
   * Display phone, always rendered LTR. OPS-CONFIRMED full replacement,
   * Ibrahim/Dr. Amer 2026-08-16 (E.164 with spaces, as supplied).
   * Alexandria's BRANCH number is +20 10 44202946; the Egypt REGIONAL line
   * in content/regions.ts stays 01103402446 on purpose — see that file.
   */
  phone: string;
  /** wa.me target, digits only. */
  whatsapp: string;
  /** Map pin — all six OPS-CONFIRMED by Ibrahim on-site, 2026-08-06. */
  coords: { lat: number; lng: number; approximate?: boolean };
  /** Branch photo under public/images/branches/ — placeholder until set. */
  photo?: string;
  franchise?: boolean;
  /** Server-enforced daily capacity where known (bdm-flow). */
  capacity?: number;
};

export const branches: Branch[] = [
  {
    id: "tagamoa",
    photo: "/images/branches/tagamoa.webp",
    coords: { lat: 30.019004, lng: 31.432151 },
    region: "egypt",
    phone: "+20 10 12747478",
    whatsapp: "201012747478",
    capacity: 8,
  },
  {
    id: "zayed",
    photo: "/images/branches/zayed.webp",
    coords: { lat: 30.019908, lng: 30.977818 },
    region: "egypt",
    phone: "+20 11 03670059",
    whatsapp: "201103670059",
    capacity: 6,
  },
  {
    id: "maadi",
    photo: "/images/branches/maadi.webp",
    coords: { lat: 29.959924, lng: 31.320286 },
    region: "egypt",
    phone: "+20 11 00512230",
    whatsapp: "201100512230",
    capacity: 3,
  },
  {
    id: "alexandria",
    photo: "/images/branches/alexandria.webp",
    coords: { lat: 31.048005, lng: 29.785749 },
    region: "egypt",
    phone: "+20 10 44202946",
    whatsapp: "201044202946",
  },
  {
    id: "damietta",
    photo: "/images/branches/damietta.webp",
    coords: { lat: 31.443499, lng: 31.675357 },
    region: "egypt",
    phone: "+20 11 26978186",
    whatsapp: "201126978186",
    franchise: true,
  },
  {
    id: "dubai",
    photo: "/images/branches/dubai.webp",
    coords: { lat: 25.117529, lng: 55.236156 },
    region: "uae",
    phone: "+971 55 205 4478",
    whatsapp: "971552054478",
  },
];

export function branchesForRegion(region: RegionId): Branch[] {
  return branches.filter((b) => b.region === region);
}

/**
 * Google Maps navigation deep link to the exact ops-confirmed pin —
 * opens turn-by-turn directions from the user's location on any platform.
 */
export function directionsUrl(branch: Branch): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${branch.coords.lat},${branch.coords.lng}`;
}
