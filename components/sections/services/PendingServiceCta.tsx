"use client";

import { useRegion } from "@/components/providers/RegionProvider";
import { Button } from "@/components/ui/Button";

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
    >
      {label}
    </Button>
  );
}
