"use client";

import { useTranslations } from "next-intl";
import { StubForm } from "@/components/forms/StubForm";
import { Label, Input, Textarea, Select, PhoneInput } from "@/components/ui/Field";

export function CareersForm() {
  const t = useTranslations("careers");
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
          <Label htmlFor="cr-name">{t("fields.name")}</Label>
          <Input id="cr-name" name="name" required />
        </div>
        <div>
          <Label htmlFor="cr-phone">{t("fields.phone")}</Label>
          <PhoneInput id="cr-phone" name="phone" required />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="cr-email">{t("fields.email")}</Label>
          <Input id="cr-email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="cr-role">{t("fields.role")}</Label>
          <Select id="cr-role" name="role">
            <option value="installer">{t("fields.roleInstaller")}</option>
            <option value="sales">{t("fields.roleSales")}</option>
            <option value="admin">{t("fields.roleAdmin")}</option>
            <option value="other">{t("fields.roleOther")}</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="cr-cv">{t("fields.cv")}</Label>
        <Input id="cr-cv" name="cv" type="url" dir="ltr" />
      </div>
      <div>
        <Label htmlFor="cr-message">{t("fields.message")}</Label>
        <Textarea id="cr-message" name="message" />
      </div>
    </StubForm>
  );
}
