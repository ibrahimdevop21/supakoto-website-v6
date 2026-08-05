"use client";

import { useTranslations } from "next-intl";
import { branches } from "@/content/branches";
import { StubForm } from "@/components/forms/StubForm";
import { Label, Input, Textarea, Select } from "@/components/ui/Field";

export function ClaimForm() {
  const t = useTranslations("warrantyClaim");
  const tBranches = useTranslations("branches");

  return (
    <StubForm
      submitLabel={t("fields.submit")}
      successText={t("success")}
      stubText={t("stub")}
      className="grid max-w-2xl gap-6"
    >
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
          accept="image/*"
          multiple
          className="file:me-3 file:rounded-card file:border-0 file:bg-ink-800 file:px-3 file:py-1 file:text-fg"
        />
        <p className="mt-2 text-small text-fg-subtle">
          {t("fields.photosHint")}
        </p>
      </div>
    </StubForm>
  );
}
