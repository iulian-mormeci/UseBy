"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

export function MissingProductReportForm() {
  const t = useTranslations("MissingProductReportForm");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const payload = {
      requestedName: form.get("requestedName"),
      note: form.get("note") || null,
    };

    const result = await submitJson("/api/missing-product-reports", "POST", payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-green-700 dark:text-green-400">
        {t("thankYou")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("nameLabel")}</span>
        <input
          type="text"
          name="requestedName"
          required
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.requestedName && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.requestedName[0]}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("noteLabel")}</span>
        <textarea
          name="note"
          rows={3}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? t("sending") : t("send")}
      </button>
    </form>
  );
}
