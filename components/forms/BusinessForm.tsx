"use client";

import { useTranslations } from "next-intl";
import { StubForm } from "@/components/forms/StubForm";
import { Label, Input, Textarea, Select, PhoneInput } from "@/components/ui/Field";

export function BusinessForm() {
  const t = useTranslations("business");
  const tCommon = useTranslations("common");

  return (
    <StubForm
      formId="business"
      submitLabel={t("fields.submit")}
      successText={t("success")}
      stubText={tCommon("formStub")}
      className="grid max-w-2xl gap-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="bz-company">{t("fields.company")}</Label>
          <Input id="bz-company" name="company" required />
        </div>
        <div>
          <Label htmlFor="bz-name">{t("fields.name")}</Label>
          <Input id="bz-name" name="name" required />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="bz-phone">{t("fields.phone")}</Label>
          <PhoneInput id="bz-phone" name="phone" required />
        </div>
        <div>
          <Label htmlFor="bz-email">{t("fields.email")}</Label>
          <Input id="bz-email" name="email" type="email" />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="bz-type">{t("fields.type")}</Label>
          <Select id="bz-type" name="type">
            <option value="fleet">{t("fields.typeFleet")}</option>
            <option value="dealer">{t("fields.typeDealer")}</option>
            <option value="building">{t("fields.typeBuilding")}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="bz-size">{t("fields.size")}</Label>
          <Input id="bz-size" name="size" />
        </div>
      </div>
      <div>
        <Label htmlFor="bz-message">{t("fields.message")}</Label>
        <Textarea id="bz-message" name="message" />
      </div>
    </StubForm>
  );
}
