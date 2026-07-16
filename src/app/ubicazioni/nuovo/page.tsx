import { getTranslations } from "next-intl/server";
import { LocationForm } from "@/components/forms/LocationForm";

export const dynamic = "force-dynamic";

export default async function NuovaUbicazionePage() {
  const t = await getTranslations("UbicazioniNuova");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <LocationForm />
    </div>
  );
}
