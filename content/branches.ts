import type { RegionId } from "./regions";

export type Branch = {
  /** Also the message key: branches.items.<id>.{name,address} */
  id: string;
  region: RegionId;
  /** Display phone, always rendered LTR. Unverified seed data — see ASSETS-NEEDED.md. */
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
    phone: "01220080189",
    whatsapp: "201220080189",
    capacity: 8,
  },
  {
    id: "zayed",
    photo: "/images/branches/zayed.webp",
    coords: { lat: 30.019908, lng: 30.977818 },
    region: "egypt",
    phone: "01156608134",
    whatsapp: "201156608134",
    capacity: 6,
  },
  {
    id: "maadi",
    photo: "/images/branches/maadi.webp",
    coords: { lat: 29.959924, lng: 31.320286 },
    region: "egypt",
    phone: "01127232340",
    whatsapp: "201127232340",
    capacity: 3,
  },
  {
    id: "alexandria",
    photo: "/images/branches/alexandria.webp",
    coords: { lat: 31.048005, lng: 29.785749 },
    region: "egypt",
    phone: "01103402446",
    whatsapp: "201103402446",
  },
  {
    id: "damietta",
    photo: "/images/branches/damietta.webp",
    coords: { lat: 31.443499, lng: 31.675357 },
    region: "egypt",
    phone: "01126978186",
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
