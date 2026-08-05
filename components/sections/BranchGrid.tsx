"use client";

import { useTranslations } from "next-intl";
import { branchesForRegion } from "@/content/branches";
import { useRegion } from "@/components/providers/RegionProvider";
import { Placeholder } from "@/components/ui/Placeholder";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";

/**
 * Branch cards, filtered by the RegionPicker state. Directions link in
 * place of a maps embed until coordinates are ops-verified (ASSETS-NEEDED).
 */
export function BranchGrid() {
  const t = useTranslations("branches");
  const { region } = useRegion();
  const list = branchesForRegion(region.id);

  return (
    <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((branch) => {
        const name = t(`items.${branch.id}.name`);
        const address = t(`items.${branch.id}.address`);
        return (
          <RevealItem key={branch.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-800">
              <Placeholder
                note={t("photoPlaceholder")}
                className="aspect-video rounded-none border-x-0 border-t-0"
              />
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-h3 font-medium">{name}</h2>
                  {branch.franchise && (
                    <span className="rounded-card border border-ink-700 px-2 py-1 text-eyebrow text-fg-muted">
                      {t("franchiseBadge")}
                    </span>
                  )}
                </div>
                <p className="text-small text-fg-muted">{address}</p>
                <p className="text-small text-fg-subtle">
                  {t("hoursUnverified")}
                </p>
                <div className="mt-auto flex flex-wrap gap-3 pt-3">
                  <a
                    href={`tel:${branch.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 rounded-card border border-ink-700 px-3 py-2 text-small transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                  >
                    <PhoneIcon className="size-4 text-sk-red" />
                    <span dir="ltr">{branch.phone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${branch.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-card border border-ink-700 px-3 py-2 text-small transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                  >
                    <WhatsAppIcon className="size-4 text-sk-red" />
                    {t("whatsapp")}
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`SupaKoto ${name} ${address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-card border border-ink-700 px-3 py-2 text-small transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                  >
                    {t("directions")}
                  </a>
                </div>
              </div>
            </article>
          </RevealItem>
        );
      })}
    </RevealStagger>
  );
}
