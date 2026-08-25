import { regions, type RegionId } from "@/content/regions";

/**
 * WhatsApp after a successful email send is optional acceleration, not the
 * record (Ibrahim, 2026-08-25 — option B). The message carries only the
 * SK-ref so ops search on one identifier in both channels. The full-body
 * builders stay in the components for the ERROR fallback, where the email
 * did not go and the chat must carry the data.
 */
export function refOnlyWhatsAppUrl(region: RegionId, ref: string, locale: string): string {
  const text =
    locale === "ar"
      ? `مرحبا، أرسلت طلب رقم ${ref} من الموقع`
      : `Hi, I just sent request ${ref} from the website`;
  return `https://wa.me/${regions[region].whatsapp}?text=${encodeURIComponent(text)}`;
}
