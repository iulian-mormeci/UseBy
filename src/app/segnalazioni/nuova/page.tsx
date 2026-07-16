import { getTranslations } from "next-intl/server";
import { MissingProductReportForm } from "@/components/forms/MissingProductReportForm";

export const dynamic = "force-dynamic";

export default async function NuovaSegnalazionePage() {
  const t = await getTranslations("SegnalazioniNuova");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>
      <MissingProductReportForm />
    </div>
  );
}
