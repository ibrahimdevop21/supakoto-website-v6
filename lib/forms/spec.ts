/**
 * The nine submission surfaces and how each lands in the inbox
 * (master prompt 2026-08-25). Shared by the API route (subject/body) and
 * the client helper (attribution keys), and read by
 * scripts/check-email-fallbacks.mjs. Pure data — no runtime imports — so it
 * is safe on both sides of the network.
 *
 * Tags: three WIZARD FLOWS (each covering several services) + five
 * standalone forms. If a new form fits none of these, add a tag here with
 * Ibrahim's word — do not invent one in a component.
 */

export const ATTRIBUTION_KEYS = [
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "gbraid",
  "wbraid",
  "ttclid",
] as const;

export type FormKey =
  | "booking"
  | "quote"
  | "enquiry"
  | "warranty_claim"
  | "careers"
  | "franchise"
  | "contact"
  | "business";

export interface FormSpec {
  emoji: string;
  tag: string;
  /** Field whose value fills the subject's <service> slot; null = fixed label. */
  serviceFrom: string | null;
  /** Fixed label when serviceFrom is null or the field is empty. */
  serviceLabel: string;
  /** English display for option ids (subject + body), when the field isn't a service id. */
  serviceMap?: Record<string, string>;
  /** Body order. Fields not listed are appended after these. */
  fields: readonly string[];
  maxFiles: number;
}

const CONTACT_SUBJECTS = {
  booking: "Booking",
  buildings: "Buildings",
  complaint: "Complaint",
  general: "General",
  other: "Other",
};
const CAREERS_ROLES = { installer: "Installer", sales: "Sales", admin: "Admin", other: "Other" };
const BUSINESS_TYPES = { fleet: "Fleet", dealer: "Dealer", building: "Building" };

export const FORM_SPECS: Record<FormKey, FormSpec> = {
  booking: {
    emoji: "🚗",
    tag: "CAR",
    serviceFrom: "service",
    serviceLabel: "Vehicle",
    fields: ["service", "region", "branch", "make", "model", "date", "time", "name", "phone"],
    maxFiles: 0,
  },
  quote: {
    emoji: "🏢",
    tag: "BUILDING",
    serviceFrom: null,
    serviceLabel: "Heat Isolation",
    fields: [
      "service",
      "region",
      "propertyType",
      "area",
      "measureMode",
      "glazingArea",
      "windowCount",
      "windowDims",
      "floors",
      "glassType",
      "problem",
      "name",
      "phone",
      "whatsapp",
      "source",
    ],
    maxFiles: 0,
  },
  enquiry: {
    emoji: "🛥️",
    tag: "MARINE",
    serviceFrom: "service",
    serviceLabel: "Enquiry",
    fields: ["service", "region", "details", "name", "phone"],
    maxFiles: 0,
  },
  warranty_claim: {
    emoji: "🛡️",
    tag: "WARRANTY",
    serviceFrom: null,
    serviceLabel: "Claim",
    fields: ["name", "phone", "email", "plate", "branch", "invoiceDate", "issue"],
    maxFiles: 4,
  },
  careers: {
    emoji: "💼",
    tag: "CAREERS",
    serviceFrom: "role",
    serviceLabel: "Application",
    serviceMap: CAREERS_ROLES,
    fields: ["name", "phone", "email", "role", "message"],
    maxFiles: 1,
  },
  franchise: {
    emoji: "🤝",
    tag: "FRANCHISE",
    serviceFrom: null,
    serviceLabel: "Franchise",
    fields: ["name", "phone", "email", "city", "budget", "message"],
    maxFiles: 0,
  },
  contact: {
    emoji: "✉️",
    tag: "CONTACT",
    serviceFrom: "subject",
    serviceLabel: "General",
    serviceMap: CONTACT_SUBJECTS,
    fields: ["name", "phone", "email", "subject", "message"],
    maxFiles: 0,
  },
  business: {
    emoji: "🏭",
    tag: "BUSINESS",
    serviceFrom: "type",
    serviceLabel: "Business",
    serviceMap: BUSINESS_TYPES,
    fields: ["name", "company", "phone", "email", "type", "size", "message"],
    maxFiles: 0,
  },
};

/** English body labels. Anything missing prints its raw key. */
export const FIELD_LABELS: Record<string, string> = {
  service: "Service",
  region: "Region",
  branch: "Branch",
  make: "Car make",
  model: "Car model",
  date: "Date",
  time: "Time slot",
  propertyType: "Property type",
  area: "Governorate / emirate",
  measureMode: "Measured by",
  glazingArea: "Glazing area (m²)",
  windowCount: "Window count",
  windowDims: "Window dimensions",
  floors: "Floors",
  glassType: "Glass type",
  problem: "Main problem",
  details: "Details",
  name: "Name",
  phone: "Phone",
  whatsapp: "WhatsApp",
  email: "Email",
  plate: "Plate",
  invoiceDate: "Invoice date",
  issue: "Issue",
  role: "Role",
  message: "Message",
  city: "City",
  budget: "Budget",
  company: "Company",
  type: "Type",
  size: "Fleet / site size",
  subject: "Subject",
  source: "Entry point",
};
