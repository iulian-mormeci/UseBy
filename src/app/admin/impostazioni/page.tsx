import { prisma } from "@/lib/prisma";
import { NotificationSettingForm } from "@/components/forms/NotificationSettingForm";

export const dynamic = "force-dynamic";

export default async function ImpostazioniPage() {
  const setting = await prisma.notificationSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Impostazioni</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Numero di giorni prima della scadenza di un prodotto in cui comparirà tra quelli &quot;in
          scadenza&quot;. Può essere sovrascritto per singolo prodotto in dispensa.
        </p>
      </div>
      <NotificationSettingForm defaultLeadDays={setting.defaultLeadDays} />
    </div>
  );
}
