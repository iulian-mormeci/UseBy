"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

type Category = { id: number; name: string };
type UsageType = "PACK" | "WEIGHT" | "QUANTITY" | "VOLUME";

const SUGGESTED_UNIT_BY_USAGE_TYPE: Record<UsageType, string> = {
  PACK: "pack",
  WEIGHT: "g",
  QUANTITY: "pcs",
  VOLUME: "ml",
};

type InitialData = {
  name?: string;
  brand?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  storageHint?: string | null;
  unit?: string;
  usageType?: UsageType;
  defaultUnit?: string;
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
  const t = useTranslations("Product");
  const tForm = useTranslations("ProductForm");
  const tCommon = useTranslations("Common");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [defaultUnit, setDefaultUnit] = useState(initialData?.defaultUnit ?? "pcs");

  function handleUsageTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    setDefaultUnit(SUGGESTED_UNIT_BY_USAGE_TYPE[event.target.value as UsageType]);
  }

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
      setUploadError(errorBody.error ?? tForm("uploadError"));
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
      usageType: form.get("usageType"),
      defaultUnit: form.get("defaultUnit"),
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
        <span className="text-sm font-medium">{tForm("nameLabel")}</span>
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
        <span className="text-sm font-medium">{tForm("brandLabel")}</span>
        <input
          type="text"
          name="brand"
          defaultValue={initialData?.brand ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{tForm("categoryLabel")}</span>
        <select
          name="categoryId"
          defaultValue={initialData?.categoryId ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">{tForm("noCategory")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{tForm("unitLabel")}</span>
        <select
          name="unit"
          defaultValue={initialData?.unit ?? "PIECE"}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="PIECE">{tForm("unit.PIECE")}</option>
          <option value="GRAM">{tForm("unit.GRAM")}</option>
          <option value="KILOGRAM">{tForm("unit.KILOGRAM")}</option>
          <option value="MILLILITER">{tForm("unit.MILLILITER")}</option>
          <option value="LITER">{tForm("unit.LITER")}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("usageTypeLabel")}</span>
        <select
          name="usageType"
          defaultValue={initialData?.usageType ?? "QUANTITY"}
          onChange={handleUsageTypeChange}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="PACK">{t("usageType.PACK")}</option>
          <option value="WEIGHT">{t("usageType.WEIGHT")}</option>
          <option value="QUANTITY">{t("usageType.QUANTITY")}</option>
          <option value="VOLUME">{t("usageType.VOLUME")}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("defaultUnitLabel")}</span>
        <input
          type="text"
          name="defaultUnit"
          value={defaultUnit}
          onChange={(event) => setDefaultUnit(event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      {lockedBarcode ? (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{tForm("barcodeLabel")}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{lockedBarcode}</span>
        </div>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{tForm("barcodeOptionalLabel")}</span>
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
        <span className="text-sm font-medium">{tForm("shelfLifeLabel")}</span>
        <input
          type="number"
          name="defaultShelfLifeDays"
          min="1"
          defaultValue={initialData?.defaultShelfLifeDays ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{tForm("storageHintLabel")}</span>
        <textarea
          name="storageHint"
          rows={2}
          defaultValue={initialData?.storageHint ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{tForm("imageLabel")}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
        {uploading && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{tForm("uploading")}</span>
        )}
        {uploadError && (
          <span className="text-xs text-red-600 dark:text-red-400">{uploadError}</span>
        )}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={tForm("imagePreviewAlt")} className="mt-2 h-24 w-24 rounded-md object-cover" />
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? tCommon("saving") : productId ? tCommon("saveChanges") : tForm("add")}
      </button>
    </form>
  );
}
