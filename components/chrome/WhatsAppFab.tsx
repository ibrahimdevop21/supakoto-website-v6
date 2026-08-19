"use client";

import { useTranslations } from "next-intl";
import { useRegion } from "@/components/providers/RegionProvider";
import { WhatsAppIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

export function WhatsAppFab() {
  const t = useTranslations("chrome");
  const { region } = useRegion();

  return (
    <a
      href={`https://wa.me/${region.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      data-track="whatsapp:fab"
      onClick={() => track("whatsapp_click", { source: "fab", region: region.id })}
      className="fixed bottom-5 end-5 z-40 flex size-13 items-center justify-center rounded-full bg-[#25d366] text-ink-950 shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
