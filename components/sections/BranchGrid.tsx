"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  branches,
  directionsUrl,
  type Branch,
} from "@/content/branches";
import { useRegion } from "@/components/providers/RegionProvider";
import { Placeholder } from "@/components/ui/Placeholder";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { Heading } from "@/components/ui/Heading";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

/**
 * Every branch is always visible (Ibrahim, 2026-08-06): the active
 * region's branches lead, the other region follows under its own heading.
 */
export function BranchGrid() {
  const tRegion = useTranslations("chrome.region");
  const { region } = useRegion();

  const mine = branches.filter((b) => b.region === region.id);
  const otherId = region.id === "egypt" ? "uae" : "egypt";
  const others = branches.filter((b) => b.region === otherId);

  return (
    <div className="space-y-14">
      <section>
        <Heading level={2} className="mb-6">
          {tRegion(region.id)}
        </Heading>
        <RevealStagger
          key={region.id}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {mine.map((branch) => (
            <RevealItem key={branch.id}>
              <BranchCard branch={branch} />
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      {others.length > 0 && (
        <section>
          <Heading level={2} className="mb-6">
            {tRegion(otherId)}
          </Heading>
          <RevealStagger
            key={otherId}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {others.map((branch) => (
              <RevealItem key={branch.id}>
                <BranchCard branch={branch} />
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      )}
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  const t = useTranslations("branches");
  const name = t(`items.${branch.id}.name`);
  const address = t(`items.${branch.id}.address`);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-ink-700 bg-ink-800">
      {branch.photo ? (
        <div className="relative aspect-video">
          <Image
            src={branch.photo}
            alt={name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        <Placeholder
          note={t("photoPlaceholder")}
          className="aspect-video rounded-none border-x-0 border-t-0"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3 font-medium">{name}</h3>
          {branch.franchise && (
            <span className="rounded-card border border-ink-700 px-2 py-1 text-eyebrow text-fg-muted">
              {t("franchiseBadge")}
            </span>
          )}
        </div>
        <p className="text-small text-fg-muted">{address}</p>
        <p className="text-small text-fg-subtle">{t("hoursUnverified")}</p>
        <div className="mt-auto flex flex-wrap gap-3 pt-3">
          <a
            href={`tel:${branch.phone.replace(/\s/g, "")}`}
            data-track="call:branch_card"
            onClick={() => {
              track("call_click", { branch: branch.id, source: "branch_card" });
              track("branch_view", { branch: branch.id, action: "call" });
            }}
            className="flex items-center gap-2 rounded-card border border-ink-700 px-3 py-2 text-small transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
          >
            <PhoneIcon className="size-4 text-sk-red" />
            <span dir="ltr">{branch.phone}</span>
          </a>
          <a
            href={`https://wa.me/${branch.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            data-track="whatsapp:branch_card"
            onClick={() => {
              track("whatsapp_click", { source: "branch_card", branch: branch.id, region: branch.region });
              track("branch_view", { branch: branch.id, action: "whatsapp" });
            }}
            className="flex items-center gap-2 rounded-card border border-ink-700 px-3 py-2 text-small transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
          >
            <WhatsAppIcon className="size-4 text-sk-red" />
            {t("whatsapp")}
          </a>
          <a
            href={directionsUrl(branch)}
            target="_blank"
            rel="noopener noreferrer"
            data-track="directions:branch_card"
            onClick={() => track("branch_view", { branch: branch.id, action: "directions" })}
            className="rounded-card border border-ink-700 px-3 py-2 text-small transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
          >
            {t("directions")}
          </a>
        </div>
      </div>
    </article>
  );
}
