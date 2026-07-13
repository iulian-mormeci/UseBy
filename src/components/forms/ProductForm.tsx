"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

type Category = { id: number; name: string };

type InitialData = {
  name?: string;
  brand?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  storageHint?: string | null;
  unit?: string;
  defaultShelfLifeDays?: number | null;
  categoryId?: number | null;
};

type CreatedProduct = { id: number; name: string };

export function ProductForm({
  categories,
  productId,
  initialData,
  mode = "catalog",
  lockedBarcode,
  onSuccess,
}: {
  categories: Category[];
  productId?: number;
  initialData?: InitialData;
  mode?: "catalog" | "pending-submission";
  lockedBarcode?: string;
  onSuccess?: (product: CreatedProduct) => void;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      setUploadError(errorBody.error ?? "Errore durante il caricamento dell'immagine");
      setUploading(false);
      return;
    }

    const data = await res.json();
    setImageUrl(data.url);
    setUploading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const categoryIdRaw = form.get("categoryId");
    const shelfLifeRaw = form.get("defaultShelfLifeDays");

    const basePayload = {
      name: form.get("name"),
      brand: form.get("brand") || null,
      imageUrl,
      storageHint: form.get("storageHint") || null,
      unit: form.get("unit"),
      defaultShelfLifeDays: shelfLifeRaw ? Number(shelfLifeRaw) : null,
      categoryId: categoryIdRaw ? Number(categoryIdRaw) : null,
    };

    const isPendingSubmission = mode === "pending-submission";
    const payload = isPendingSubmission
      ? { ...basePayload, barcode: lockedBarcode }
      : { ...basePayload, barcode: lockedBarcode ?? (form.get("barcode") || null) };

    const endpoint = isPendingSubmission
      ? "/api/pending-product-submissions"
      : productId
        ? `/api/products/${productId}`
        : "/api/products";
    const method = isPendingSubmission ? "POST" : productId ? "PATCH" : "POST";
    const result = await submitJson(endpoint, method, payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    const createdProduct = isPendingSubmission
      ? (result.data as { product: CreatedProduct }).product
      : (result.data as CreatedProduct);

    if (onSuccess) {
      onSuccess(createdProduct);
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
        <span className="text-sm font-medium">Marca (opzionale)</span>
        <input
          type="text"
          name="brand"
          defaultValue={initialData?.brand ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
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

      {lockedBarcode ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Codice a barre</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{lockedBarcode}</span>
        </div>
      ) : (
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
      )}

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

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Suggerimento di conservazione (opzionale)</span>
        <textarea
          name="storageHint"
          rows={2}
          defaultValue={initialData?.storageHint ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Immagine (opzionale)</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
        {uploading && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Caricamento...</span>
        )}
        {uploadError && (
          <span className="text-xs text-red-600 dark:text-red-400">{uploadError}</span>
        )}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Anteprima prodotto" className="mt-2 h-24 w-24 rounded-md object-cover" />
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? "Salvataggio..." : productId ? "Salva modifiche" : "Aggiungi"}
      </button>
    </form>
  );
}
