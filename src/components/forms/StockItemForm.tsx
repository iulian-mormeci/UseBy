"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

type Option = { id: number; name: string };

type InitialData = {
  productId: number;
  locationId: number;
  quantity: string;
  expiryDate: string | null;
  expiryType: "USE_BY" | "BEST_BEFORE";
  purchasedAt: string | null;
  openedAt: string | null;
  notes: string | null;
};

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function StockItemForm({
  products,
  locations,
  stockItemId,
  initialData,
}: {
  products: Option[];
  locations: Option[];
  stockItemId?: number;
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
    const payload = {
      productId: Number(form.get("productId")),
      locationId: Number(form.get("locationId")),
      quantity: form.get("quantity"),
      expiryDate: form.get("expiryDate") || null,
      expiryType: form.get("expiryType"),
      purchasedAt: form.get("purchasedAt") || null,
      openedAt: form.get("openedAt") || null,
      notes: form.get("notes") || null,
    };

    const endpoint = stockItemId ? `/api/stock-items/${stockItemId}` : "/api/stock-items";
    const method = stockItemId ? "PATCH" : "POST";
    const result = await submitJson(endpoint, method, payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    router.push("/dispensa");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Prodotto</span>
        <select
          name="productId"
          required
          defaultValue={initialData?.productId ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="" disabled>
            Seleziona un prodotto
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        {fieldErrors.productId && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.productId[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Ubicazione</span>
        <select
          name="locationId"
          required
          defaultValue={initialData?.locationId ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="" disabled>
            Seleziona un&apos;ubicazione
          </option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        {fieldErrors.locationId && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.locationId[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Quantità</span>
        <input
          type="number"
          name="quantity"
          step="0.01"
          min="0"
          required
          defaultValue={initialData?.quantity ?? "1"}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.quantity && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.quantity[0]}</span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Scadenza</span>
          <input
            type="date"
            name="expiryDate"
            defaultValue={toDateInputValue(initialData?.expiryDate ?? null)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Tipo scadenza</span>
          <select
            name="expiryType"
            defaultValue={initialData?.expiryType ?? "USE_BY"}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="USE_BY">Da consumarsi entro</option>
            <option value="BEST_BEFORE">Da consumarsi preferibilmente entro</option>
          </select>
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Acquistato il</span>
          <input
            type="date"
            name="purchasedAt"
            defaultValue={toDateInputValue(initialData?.purchasedAt ?? null)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Aperto il</span>
          <input
            type="date"
            name="openedAt"
            defaultValue={toDateInputValue(initialData?.openedAt ?? null)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Note</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={initialData?.notes ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? "Salvataggio..." : stockItemId ? "Salva modifiche" : "Aggiungi"}
      </button>
    </form>
  );
}
