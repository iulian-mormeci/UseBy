"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

type UsageType = "PACK" | "WEIGHT" | "QUANTITY" | "VOLUME";
type ProductOption = { id: number; name: string; usageType: UsageType; defaultUnit: string };
type Option = { id: number; name: string };
type ZoneOption = { id: number; name: string; locationId: number };

type InitialData = {
  productId: number;
  locationId: number;
  zoneId: number | null;
  quantity: string;
  initialQuantity: string | null;
  currentQuantity: string | null;
  expiryDate: string | null;
  expiryType: "USE_BY" | "BEST_BEFORE";
  leadDays: number | null;
  purchasedAt: string | null;
  openedAt: string | null;
  notes: string | null;
};

const PACK_STEPS = [
  { value: "0", key: "empty" },
  { value: "33", key: "nearlyEmpty" },
  { value: "66", key: "partial" },
  { value: "100", key: "full" },
] as const;

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function StockItemForm({
  products,
  locations,
  zones,
  stockItemId,
  initialData,
  defaultProductId,
}: {
  products: ProductOption[];
  locations: Option[];
  zones: ZoneOption[];
  stockItemId?: number;
  initialData?: InitialData;
  defaultProductId?: number;
}) {
  const router = useRouter();
  const t = useTranslations("StockItemForm");
  const tQuantity = useTranslations("QuantityIndicator");
  const tCommon = useTranslations("Common");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [locationId, setLocationId] = useState<string>(
    initialData?.locationId ? String(initialData.locationId) : "",
  );
  const [productId, setProductId] = useState<string>(
    initialData?.productId ? String(initialData.productId) : defaultProductId ? String(defaultProductId) : "",
  );
  const [initialQuantity, setInitialQuantity] = useState(initialData?.initialQuantity ?? "");
  const [currentQuantity, setCurrentQuantity] = useState(
    initialData?.currentQuantity ?? initialData?.initialQuantity ?? "",
  );

  const zonesForLocation = zones.filter((zone) => String(zone.locationId) === locationId);
  const selectedProduct = products.find((product) => String(product.id) === productId);
  const usageType = selectedProduct?.usageType ?? "QUANTITY";
  const unit = selectedProduct?.defaultUnit ?? "pcs";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const zoneIdRaw = form.get("zoneId");
    const leadDaysRaw = form.get("leadDays");

    const payload = {
      productId: Number(form.get("productId")),
      locationId: Number(form.get("locationId")),
      zoneId: zoneIdRaw ? Number(zoneIdRaw) : null,
      quantity: form.get("quantity"),
      initialQuantity: initialQuantity ? Number(initialQuantity) : null,
      currentQuantity: currentQuantity ? Number(currentQuantity) : null,
      expiryDate: form.get("expiryDate") || null,
      expiryType: form.get("expiryType"),
      leadDays: leadDaysRaw ? Number(leadDaysRaw) : null,
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
        <span className="text-sm font-medium">{t("productLabel")}</span>
        <select
          name="productId"
          required
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="" disabled>
            {t("selectProduct")}
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

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{t("locationLabel")}</span>
          <select
            name="locationId"
            required
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="" disabled>
              {t("selectLocation")}
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          {fieldErrors.locationId && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {fieldErrors.locationId[0]}
            </span>
          )}
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{t("zoneLabel")}</span>
          <select
            name="zoneId"
            defaultValue={initialData?.zoneId ?? ""}
            disabled={zonesForLocation.length === 0}
            className="rounded-md border border-gray-300 px-3 py-2 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">{t("noZone")}</option>
            {zonesForLocation.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("quantityLabel")}</span>
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

      {selectedProduct && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
          {usageType === "PACK" ? (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">{t("packStateLabel")}</span>
              <select
                value={currentQuantity || "100"}
                onChange={(event) => {
                  setInitialQuantity("100");
                  setCurrentQuantity(event.target.value);
                }}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              >
                {PACK_STEPS.map((step) => (
                  <option key={step.value} value={step.value}>
                    {tQuantity(step.key)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("initialQuantityLabel")} ({unit})
                </span>
                <input
                  type="number"
                  step={usageType === "QUANTITY" ? "1" : "0.01"}
                  min="0"
                  value={initialQuantity}
                  onChange={(event) => {
                    setInitialQuantity(event.target.value);
                    if (!currentQuantity) setCurrentQuantity(event.target.value);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {t("currentQuantityLabel")} ({unit})
                </span>
                {usageType === "QUANTITY" ? (
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={currentQuantity}
                    onChange={(event) => setCurrentQuantity(event.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={initialQuantity || "0"}
                      step="0.01"
                      value={currentQuantity || "0"}
                      onChange={(event) => setCurrentQuantity(event.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={initialQuantity || undefined}
                      value={currentQuantity}
                      onChange={(event) => setCurrentQuantity(event.target.value)}
                      className="w-24 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>
                )}
              </label>
            </>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{t("expiryLabel")}</span>
          <input
            type="date"
            name="expiryDate"
            defaultValue={toDateInputValue(initialData?.expiryDate ?? null)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{t("expiryTypeLabel")}</span>
          <select
            name="expiryType"
            defaultValue={initialData?.expiryType ?? "USE_BY"}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="USE_BY">{t("useBy")}</option>
            <option value="BEST_BEFORE">{t("bestBefore")}</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("leadDaysLabel")}</span>
        <input
          type="number"
          name="leadDays"
          min="0"
          defaultValue={initialData?.leadDays ?? ""}
          placeholder={t("leadDaysPlaceholder")}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{t("purchasedAtLabel")}</span>
          <input
            type="date"
            name="purchasedAt"
            defaultValue={toDateInputValue(initialData?.purchasedAt ?? null)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{t("openedAtLabel")}</span>
          <input
            type="date"
            name="openedAt"
            defaultValue={toDateInputValue(initialData?.openedAt ?? null)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("notesLabel")}</span>
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
        {submitting ? tCommon("saving") : stockItemId ? tCommon("saveChanges") : t("add")}
      </button>
    </form>
  );
}
