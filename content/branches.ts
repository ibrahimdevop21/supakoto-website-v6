import type { RegionId } from "./regions";

export type Branch = {
  /** Also the message key: branches.items.<id>.{name,address} */
  id: string;
  region: RegionId;
  /** Display phone, always rendered LTR. Unverified seed data — see ASSETS-NEEDED.md. */
  phone: string;
  /** wa.me target, digits only. */
  whatsapp: string;
  /**
   * Map pin. Tagamoa/Maadi/Zayed/Dubai from V2's maintained data file
   * (geography cross-checked); Damietta from V2's contact page and
   * Alexandria estimated — both flagged approximate until ops confirms.
   */
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
    coords: { lat: 30.018919, lng: 31.432121 },
    region: "egypt",
    phone: "01220080189",
    whatsapp: "201220080189",
    capacity: 8,
  },
  {
    id: "zayed",
    coords: { lat: 30.019908, lng: 30.977829 },
    region: "egypt",
    phone: "01156608134",
    whatsapp: "201156608134",
    capacity: 6,
  },
  {
    id: "maadi",
    coords: { lat: 29.959868, lng: 31.320307 },
    region: "egypt",
    phone: "01127232340",
    whatsapp: "201127232340",
    capacity: 3,
  },
  {
    id: "alexandria",
    coords: { lat: 31.143, lng: 29.961, approximate: true },
    region: "egypt",
    phone: "01103402446",
    whatsapp: "201103402446",
  },
  {
    id: "damietta",
    coords: { lat: 31.41648, lng: 31.81332, approximate: true },
    region: "egypt",
    phone: "01126978186",
    whatsapp: "201126978186",
    franchise: true,
  },
  {
    id: "dubai",
    coords: { lat: 25.13424, lng: 55.23184 },
    region: "uae",
    phone: "+971 55 205 4478",
    whatsapp: "971552054478",
  },
];

export function branchesForRegion(region: RegionId): Branch[] {
  return branches.filter((b) => b.region === region);
}
