"use client";

import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

export function NotificationSettingForm({ defaultLeadDays }: { defaultLeadDays: number }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const payload = { defaultLeadDays: Number(form.get("defaultLeadDays")) };

    const result = await submitJson("/api/notification-settings", "PATCH", payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    setSaved(true);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
      {saved && <p className="text-sm text-green-700 dark:text-green-400">Impostazioni salvate.</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Preavviso scadenza di default (giorni)</span>
        <input
          type="number"
          name="defaultLeadDays"
          min="0"
          required
          defaultValue={defaultLeadDays}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.defaultLeadDays && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.defaultLeadDays[0]}
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-fit rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? "Salvataggio..." : "Salva"}
      </button>
    </form>
  );
}
