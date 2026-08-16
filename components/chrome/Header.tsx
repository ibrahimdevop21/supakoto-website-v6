"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/chrome/LocaleSwitcher";
import { RegionPicker } from "@/components/chrome/RegionPicker";
import { ChevronDown, CloseIcon, MenuIcon } from "@/components/icons";
import logoLockup from "@/public/brand/logo-lockup.webp";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on navigation.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled
          ? "border-b border-ink-700 bg-ink-950/90 backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-(--container-content) items-center justify-between gap-6 px-(--spacing-gutter)">
        <Link
          href="/"
          className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
        >
          <Image
            src={logoLockup}
            alt={t("logoAlt")}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <DesktopNavItem key={item.key} item={item} pathname={pathname} />
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <RegionPicker className="hidden sm:block" />
          {/* Wrapper carries the responsive visibility: cn() is a plain
              join, so a `hidden` on the Button itself loses to the
              base `inline-flex` in stylesheet order. */}
          <div className="hidden md:block">
            <Button href="/booking" size="sm">
              {t("cta")}
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={drawerOpen}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-ink-700 text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
          >
            <MenuIcon className="size-5" />
          </button>
        </div>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function DesktopNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const linkClass = (active: boolean) =>
    cn(
      "relative block rounded-card px-3 py-2 text-small font-medium transition-colors",
      "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-sk-red after:opacity-0 after:transition-opacity",
      active ? "text-fg after:opacity-100" : "text-fg-muted hover:text-fg",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
    );

  if ("href" in item) {
    return (
      <li>
        <Link
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={linkClass(isActive(pathname, item.href))}
        >
          {t(item.key)}
        </Link>
      </li>
    );
  }

  const childActive = item.children.some((c) => isActive(pathname, c.href));

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={cn(linkClass(childActive), "flex items-center gap-1")}
      >
        {t(item.key)}
        <ChevronDown
          className={cn("size-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {/* Always in the DOM (SSR-crawlable child links — Phase 17: the
          conditional render left /about, /faq, /gallery, /contact, /careers
          with no server-rendered link anywhere). Visibility is animated;
          `inert` keeps the closed menu out of the tab order. */}
      <motion.ul
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
          open: { opacity: 1, y: 0, visibility: "visible" },
          closed: {
            opacity: 0,
            y: reduce ? 0 : 8,
            transitionEnd: { visibility: "hidden" },
          },
        }}
        transition={{ duration: reduce ? 0 : 0.25, ease: EASE_OUT }}
        style={{ visibility: open ? "visible" : "hidden" }}
        aria-hidden={!open}
        inert={!open}
        className="absolute start-0 top-full min-w-48 rounded-card border border-ink-700 bg-ink-900 p-1.5"
      >
        {item.children.map((child) => (
          <li key={child.key}>
            <Link
              href={child.href}
              aria-current={
                isActive(pathname, child.href) ? "page" : undefined
              }
              tabIndex={open ? undefined : -1}
              className={cn(
                "block rounded-card px-3 py-2 text-small transition-colors",
                isActive(pathname, child.href)
                  ? "bg-ink-800 text-fg"
                  : "text-fg-muted hover:bg-ink-800 hover:text-fg",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
              )}
            >
              {t(child.key)}
            </Link>
          </li>
        ))}
      </motion.ul>
    </li>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex flex-col bg-ink-950 lg:hidden"
        >
          <div className="flex h-18 items-center justify-between px-(--spacing-gutter)">
            <span className="font-display text-h3 font-bold">SupaKoto</span>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("closeMenu")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-ink-700 text-fg transition-colors hover:border-fg-subtle hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-(--spacing-gutter) pb-8">
            <ul className="divide-y divide-ink-700 border-y border-ink-700">
              {NAV.map((item) =>
                "href" in item ? (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="block py-4 text-h3 font-medium text-fg"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ) : (
                  <li key={item.key}>
                    <button
                      type="button"
                      aria-expanded={openGroup === item.key}
                      onClick={() =>
                        setOpenGroup((g) => (g === item.key ? null : item.key))
                      }
                      className="flex w-full items-center justify-between py-4 text-h3 font-medium text-fg"
                    >
                      {t(item.key)}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          openGroup === item.key && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openGroup === item.key && (
                        <motion.ul
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <li key={child.key}>
                              <Link
                                href={child.href}
                                className="block py-3 ps-4 text-body text-fg-muted"
                              >
                                {t(child.key)}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                ),
              )}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LocaleSwitcher />
              <RegionPicker />
              <Button href="/booking">{t("cta")}</Button>
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
