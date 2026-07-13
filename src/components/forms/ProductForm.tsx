"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

type Category = { id: number; name: string };

type InitialData = {
  name: string;
  barcode: string | null;
  unit: string;
  defaultShelfLifeDays: number | null;
  categoryId: number | null;
};

export function ProductForm({
  categories,
  productId,
  initialData,
}: {
  categories: Category[];
  productId?: number;
  initialData?: InitialData;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const categoryIdRaw = form.get("categoryId");
    const shelfLifeRaw = form.get("defaultShelfLifeDays");

    const payload = {
      name: form.get("name"),
      barcode: form.get("barcode") || null,
      unit: form.get("unit"),
      defaultShelfLifeDays: shelfLifeRaw ? Number(shelfLifeRaw) : null,
      categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
    };

    const endpoint = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PATCH" : "POST";
    const result = await submitJson(endpoint, method, payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    router.push("/prodotti");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nome</span>
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
        <span className="text-sm font-medium">Categoria</span>
        <select
          name="categoryId"
          defaultValue={initialData?.categoryId ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">Nessuna categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Unità di misura</span>
        <select
          name="unit"
          defaultValue={initialData?.unit ?? "PIECE"}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="PIECE">Pezzo</option>
          <option value="GRAM">Grammi</option>
          <option value="KILOGRAM">Chilogrammi</option>
          <option value="MILLILITER">Millilitri</option>
          <option value="LITER">Litri</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Codice a barre (opzionale)</span>
        <input
          type="text"
          name="barcode"
          defaultValue={initialData?.barcode ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.barcode && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.barcode[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Durata tipica (giorni, opzionale)</span>
        <input
          type="number"
          name="defaultShelfLifeDays"
          min="1"
          defaultValue={initialData?.defaultShelfLifeDays ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? "Salvataggio..." : productId ? "Salva modifiche" : "Aggiungi"}
      </button>
    </form>
  );
}
