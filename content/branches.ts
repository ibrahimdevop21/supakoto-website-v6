import type { RegionId } from "./regions";

export type Branch = {
  /** Also the message key: branches.items.<id>.{name,address} */
  id: string;
  region: RegionId;
  /** Display phone, always rendered LTR. Unverified seed data — see ASSETS-NEEDED.md. */
  phone: string;
  /** wa.me target, digits only. */
  whatsapp: string;
  franchise?: boolean;
  /** Server-enforced daily capacity where known (bdm-flow). */
  capacity?: number;
};

export const branches: Branch[] = [
  {
    id: "tagamoa",
    region: "egypt",
    phone: "01220080189",
    whatsapp: "201220080189",
    capacity: 8,
  },
  {
    id: "zayed",
    region: "egypt",
    phone: "01156608134",
    whatsapp: "201156608134",
    capacity: 6,
  },
  {
    id: "maadi",
    region: "egypt",
    phone: "01127232340",
    whatsapp: "201127232340",
    capacity: 3,
  },
  {
    id: "alexandria",
    region: "egypt",
    phone: "01103402446",
    whatsapp: "201103402446",
  },
  {
    id: "damietta",
    region: "egypt",
    phone: "01126978186",
    whatsapp: "201126978186",
    franchise: true,
  },
  {
    id: "dubai",
    region: "uae",
    phone: "+971 55 205 4478",
    whatsapp: "971552054478",
  },
];

export function branchesForRegion(region: RegionId): Branch[] {
  return branches.filter((b) => b.region === region);
}
