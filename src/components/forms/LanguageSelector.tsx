"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Locale } from "@/i18n/request";

export function LanguageSelector({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = useTranslations("Settings");
  const [submitting, setSubmitting] = useState(false);

  async function handleChange(newLocale: Locale) {
    setSubmitting(true);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: newLocale }),
    });
    router.refresh();
    setSubmitting(false);
  }

  return (
    <label className="flex max-w-sm flex-col gap-1">
      <span className="text-sm font-medium">{t("languageLabel")}</span>
      <select
        value={locale}
        disabled={submitting}
        onChange={(event) => handleChange(event.target.value as Locale)}
        className="rounded-md border border-gray-300 px-3 py-2 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
      >
        <option value="en">English</option>
        <option value="it">Italiano</option>
      </select>
    </label>
  );
}
