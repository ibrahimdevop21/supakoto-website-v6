"use client";

import { useTranslations } from "next-intl";
import { StubForm } from "@/components/forms/StubForm";
import { Label, Input, Textarea, PhoneInput } from "@/components/ui/Field";

export function FranchiseForm() {
  const t = useTranslations("franchise");
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
          <Label htmlFor="fr-name">{t("fields.name")}</Label>
          <Input id="fr-name" name="name" required />
        </div>
        <div>
          <Label htmlFor="fr-phone">{t("fields.phone")}</Label>
          <PhoneInput id="fr-phone" name="phone" required />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="fr-email">{t("fields.email")}</Label>
          <Input id="fr-email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="fr-city">{t("fields.city")}</Label>
          <Input id="fr-city" name="city" required />
        </div>
      </div>
      <div>
        <Label htmlFor="fr-budget">{t("fields.budget")}</Label>
        <Input id="fr-budget" name="budget" />
      </div>
      <div>
        <Label htmlFor="fr-message">{t("fields.message")}</Label>
        <Textarea id="fr-message" name="message" />
      </div>
    </StubForm>
  );
}
