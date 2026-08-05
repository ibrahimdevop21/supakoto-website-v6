"use client";

import { useTranslations } from "next-intl";
import { useRegion } from "@/components/providers/RegionProvider";
import { StubForm } from "@/components/forms/StubForm";
import { Label, Input, Textarea, Select, PhoneInput } from "@/components/ui/Field";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";

export function ContactInfo() {
  const t = useTranslations("contact.info");
  const { region } = useRegion();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-card border border-ink-700 bg-ink-800 p-5">
        <p className="flex items-center gap-2 text-small text-fg-muted">
          <PhoneIcon className="size-4 text-sk-red" />
          {t("phone")}
        </p>
        <a
          href={`tel:${region.phone.replace(/\s/g, "")}`}
          dir="ltr"
          className="mt-2 block font-medium text-fg hover:text-fg-muted"
        >
          {region.phone}
        </a>
      </div>
      <div className="rounded-card border border-ink-700 bg-ink-800 p-5">
        <p className="flex items-center gap-2 text-small text-fg-muted">
          <WhatsAppIcon className="size-4 text-sk-red" />
          {t("whatsapp")}
        </p>
        <a
          href={`https://wa.me/${region.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className="mt-2 block font-medium text-fg hover:text-fg-muted"
        >
          +{region.whatsapp}
        </a>
      </div>
      <div className="rounded-card border border-ink-700 bg-ink-800 p-5">
        <p className="text-small text-fg-muted">{t("hours")}</p>
        <p className="mt-2 font-medium text-fg">{t("hoursValue")}</p>
      </div>
    </div>
  );
}

export function ContactForm() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");

  return (
    <StubForm
      submitLabel={t("fields.submit")}
      successText={t("success")}
      stubText={tCommon("formStub")}
      className="grid max-w-2xl gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="ct-name">{t("fields.name")}</Label>
          <Input id="ct-name" name="name" required />
        </div>
        <div>
          <Label htmlFor="ct-phone">{t("fields.phone")}</Label>
          <PhoneInput id="ct-phone" name="phone" required />
        </div>
      </div>
      <div>
        <Label htmlFor="ct-email">{t("fields.email")}</Label>
        <Input id="ct-email" name="email" type="email" />
      </div>
      <div>
        {/* Subject dropdown includes Complaint — absorbs the reference
            site's /complaints route per STRUCTURE-SPEC. */}
        <Label htmlFor="ct-subject">{t("fields.subject")}</Label>
        <Select id="ct-subject" name="subject">
          <option value="general">{t("fields.subjectGeneral")}</option>
          <option value="booking">{t("fields.subjectBooking")}</option>
          <option value="complaint">{t("fields.subjectComplaint")}</option>
          <option value="other">{t("fields.subjectOther")}</option>
        </Select>
        <p className="mt-2 text-small text-fg-subtle">{t("complaintNote")}</p>
      </div>
      <div>
        <Label htmlFor="ct-message">{t("fields.message")}</Label>
        <Textarea id="ct-message" name="message" required />
      </div>
    </StubForm>
  );
}
