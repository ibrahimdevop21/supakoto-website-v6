"use client";

import { useRegion } from "@/components/providers/RegionProvider";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

/**
 * Region-aware WhatsApp CTA for services whose TAKAI product line is
 * still unconfirmed — quotation conversation instead of booking.
 */
export function PendingServiceCta({
  label,
  message,
}: {
  label: string;
  message: string;
}) {
  const { region } = useRegion();
  return (
    <Button
      href={`https://wa.me/${region.whatsapp}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      data-track="whatsapp:service_page"
      onClick={() => track("whatsapp_click", { source: "service_page", region: region.id })}
    >
      {label}
    </Button>
  );
}
