"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "@/lib/nav";
import { SOCIAL_ICONS, PhoneIcon, WhatsAppIcon, MailIcon } from "@/components/icons";
import { useRegion } from "@/components/providers/RegionProvider";
import { TrustBadges } from "@/components/chrome/TrustBadges";
import logoLockup from "@/public/brand/logo-lockup.webp";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tAuth = useTranslations("authentic");
  const { region } = useRegion();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-700 bg-ink-900">
      <div className="mx-auto w-full max-w-(--container-content) px-(--spacing-gutter) py-16">
        {/* Zone 1 — logo + tagline */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Image src={logoLockup} alt={tNav("logoAlt")} className="h-12 w-auto" />
          <p className="max-w-md text-fg-muted">{t("tagline")}</p>
        </div>

        {/* Zone 2 — social row */}
        <ul className="mt-8 flex items-center justify-center gap-2">
          {SOCIAL_LINKS.map(({ key, href }) => {
            const Icon = SOCIAL_ICONS[key];
            return (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(`social.${key}`)}
                  className="flex size-10 items-center justify-center rounded-card border border-ink-700 text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Zone 3 — region-aware contact */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <h2 className="text-small font-medium text-fg-muted">
            {t("contactHeading")}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${region.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-fg transition-colors hover:text-fg-muted"
            >
              <PhoneIcon className="size-4 text-sk-red" />
              <span dir="ltr">{region.phone}</span>
            </a>
            <a
              href={`https://wa.me/${region.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-fg transition-colors hover:text-fg-muted"
            >
              <WhatsAppIcon className="size-4 text-sk-red" />
              {t("whatsapp")}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-2 text-fg transition-colors hover:text-fg-muted"
            >
              <MailIcon className="size-4 text-sk-red" />
              <span dir="ltr">{CONTACT_EMAIL}</span>
            </a>
          </div>
        </div>

        <TrustBadges />

        {/* Trust-adjacent: the authenticity page (sole authorized TAKAI
            distributor — how to verify). Added 2026-08-16. */}
        <p className="mt-8 text-center text-small">
          <Link
            href="/authentic"
            className="text-fg-muted underline decoration-ink-700 underline-offset-4 transition-colors hover:text-fg hover:decoration-fg-subtle"
          >
            {tAuth("links.footer")}
          </Link>
        </p>

        {/* Zone 4 — legal */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-700 pt-6 text-small text-fg-muted sm:flex-row">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-fg">
              {t("privacy")}
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms" className="transition-colors hover:text-fg">
              {t("terms")}
            </Link>
          </div>
          <p>{t("rights", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
