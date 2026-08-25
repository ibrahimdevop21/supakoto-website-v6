"use client";

import { useTranslations } from "next-intl";
import { branches } from "@/content/branches";
import { FormShell } from "@/components/forms/FormShell";
import { Label, Input, Textarea, Select, PhoneInput } from "@/components/ui/Field";

export function ClaimForm() {
  const t = useTranslations("warrantyClaim");
  const tBranches = useTranslations("branches");

  return (
    <FormShell
      formId="warranty_claim"
      submitLabel={t("fields.submit")}
      successText={t("success")}
      className="grid max-w-2xl gap-6"
    >
      {/* Phase 23: a claim without contact details can't be answered. */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="claim-name">{t("fields.name")}</Label>
          <Input id="claim-name" name="name" required />
        </div>
        <div>
          <Label htmlFor="claim-phone">{t("fields.phone")}</Label>
          <PhoneInput id="claim-phone" name="phone" required />
        </div>
      </div>
      {/* Optional (Ibrahim, 2026-08-25): a claim is a multi-day process where
          email is the natural channel; it becomes the Reply-To of the email. */}
      <div>
        <Label htmlFor="claim-email">{t("fields.email")}</Label>
        <Input id="claim-email" name="email" type="email" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="claim-plate">{t("fields.plate")}</Label>
        <Input id="claim-plate" name="plate" required />
      </div>
      <div>
        <Label htmlFor="claim-branch">{t("fields.branch")}</Label>
        <Select id="claim-branch" name="branch" required>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {tBranches(`items.${b.id}.name`)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="claim-date">{t("fields.invoiceDate")}</Label>
        <Input id="claim-date" name="invoiceDate" type="date" required />
      </div>
      <div>
        <Label htmlFor="claim-issue">{t("fields.issue")}</Label>
        <Textarea
          id="claim-issue"
          name="issue"
          placeholder={t("fields.issuePlaceholder")}
          required
        />
      </div>
      <div>
        <Label htmlFor="claim-photos">{t("fields.photos")}</Label>
        <Input
          id="claim-photos"
          name="photos"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={(e) => {
            // Vercel's 4.5 MB body cap would 413 before the server sees the
            // files — block over-size selections here with a clear message.
            const input = e.currentTarget;
            const total = [...(input.files ?? [])].reduce((sum, f) => sum + f.size, 0);
            const tooMany = (input.files?.length ?? 0) > 4;
            input.setCustomValidity(total > 4 * 1024 * 1024 || tooMany ? t("fields.photosTooLarge") : "");
            input.reportValidity();
          }}
          className="file:me-3 file:rounded-card file:border-0 file:bg-ink-800 file:px-3 file:py-1 file:text-fg"
        />
        <p className="mt-2 text-small text-fg-subtle">
          {t("fields.photosHint")}
        </p>
      </div>
    </FormShell>
  );
}
