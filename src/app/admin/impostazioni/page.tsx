import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { NotificationSettingForm } from "@/components/forms/NotificationSettingForm";
import { LanguageSelector } from "@/components/forms/LanguageSelector";
import type { Locale } from "@/i18n/request";

export const dynamic = "force-dynamic";

export default async function ImpostazioniPage() {
  const [setting, locale, t] = await Promise.all([
    prisma.notificationSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    getLocale(),
    getTranslations("Settings"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("leadDaysHint")}</p>
      </div>
      <NotificationSettingForm defaultLeadDays={setting.defaultLeadDays} />

      <div>
        <h2 className="mb-3 text-sm font-semibold">{t("languageSectionTitle")}</h2>
        <LanguageSelector locale={locale as Locale} />
      </div>
    </div>
  );
}
