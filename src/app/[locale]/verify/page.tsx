import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import VerifyForm from "./VerifyForm";

export default async function VerifyPage() {
  const t = await getTranslations("verify");
  const tc = await getTranslations("common");
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-sm mx-auto">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-center mb-2">{t("title")}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8">
          {t("description")}
        </p>
        <Suspense fallback={<div className="text-center py-8 text-[var(--color-text-secondary)]">{tc("loading")}</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
