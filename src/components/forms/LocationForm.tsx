"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

export function LocationForm({
  locationId,
  initialData,
}: {
  locationId?: number;
  initialData?: { name: string; type: string };
}) {
  const router = useRouter();
  const t = useTranslations("LocationForm");
  const tCommon = useTranslations("Common");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const payload = { name: form.get("name"), type: form.get("type") };

    const endpoint = locationId ? `/api/locations/${locationId}` : "/api/locations";
    const method = locationId ? "PATCH" : "POST";
    const result = await submitJson(endpoint, method, payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    router.push("/ubicazioni");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("nameLabel")}</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={initialData?.name ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.name && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.name[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("typeLabel")}</span>
        <select
          name="type"
          defaultValue={initialData?.type ?? "PANTRY"}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="PANTRY">{t("type.PANTRY")}</option>
          <option value="FRIDGE">{t("type.FRIDGE")}</option>
          <option value="FREEZER">{t("type.FREEZER")}</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? tCommon("saving") : locationId ? tCommon("saveChanges") : t("add")}
      </button>
    </form>
  );
}
