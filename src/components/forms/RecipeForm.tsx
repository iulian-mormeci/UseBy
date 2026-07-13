"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitJson, type FieldErrors } from "@/lib/api-client";

type Product = { id: number; name: string };

type IngredientRow = {
  productId: string;
  quantity: string;
  optional: boolean;
};

type InitialData = {
  title: string;
  instructions: string;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  notes: string | null;
  ingredients: { productId: number; quantity: string | null; optional: boolean }[];
};

function emptyRow(): IngredientRow {
  return { productId: "", quantity: "", optional: false };
}

export function RecipeForm({
  products,
  recipeId,
  initialData,
}: {
  products: Product[];
  recipeId?: number;
  initialData?: InitialData;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<IngredientRow[]>(
    initialData
      ? initialData.ingredients.map((i) => ({
          productId: String(i.productId),
          quantity: i.quantity ?? "",
          optional: i.optional,
        }))
      : [emptyRow()],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateRow(index: number, patch: Partial<IngredientRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const servingsRaw = form.get("servings");
    const prepRaw = form.get("prepMinutes");
    const cookRaw = form.get("cookMinutes");

    const payload = {
      title: form.get("title"),
      instructions: form.get("instructions"),
      servings: servingsRaw ? Number(servingsRaw) : null,
      prepMinutes: prepRaw ? Number(prepRaw) : null,
      cookMinutes: cookRaw ? Number(cookRaw) : null,
      notes: form.get("notes") || null,
      ingredients: rows
        .filter((row) => row.productId !== "")
        .map((row) => ({
          productId: Number(row.productId),
          quantity: row.quantity ? Number(row.quantity) : null,
          optional: row.optional,
        })),
    };

    const endpoint = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes";
    const method = recipeId ? "PATCH" : "POST";
    const result = await submitJson(endpoint, method, payload);

    if (!result.ok) {
      setFormError(result.message);
      setFieldErrors(result.fieldErrors);
      setSubmitting(false);
      return;
    }

    const recipe = result.data as { id: number };
    router.push(`/ricette/${recipe.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Titolo</span>
        <input
          type="text"
          name="title"
          required
          defaultValue={initialData?.title ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.title && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.title[0]}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Istruzioni</span>
        <textarea
          name="instructions"
          rows={5}
          required
          defaultValue={initialData?.instructions ?? ""}
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        {fieldErrors.instructions && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {fieldErrors.instructions[0]}
          </span>
        )}
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Porzioni</span>
          <input
            type="number"
            name="servings"
            min="1"
            defaultValue={initialData?.servings ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Preparazione (min)</span>
          <input
            type="number"
            name="prepMinutes"
            min="1"
            defaultValue={initialData?.prepMinutes ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Cottura (min)</span>
          <input
            type="number"
            name="cookMinutes"
            min="1"
            defaultValue={initialData?.cookMinutes ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Ingredienti</span>
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            + Aggiungi ingrediente
          </button>
        </div>

        {fieldErrors.ingredients && (
          <span className="text-xs text-red-600 dark:text-red-400">{fieldErrors.ingredients[0]}</span>
        )}

        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <select
              value={row.productId}
              onChange={(e) => updateRow(index, { productId: e.target.value })}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Seleziona un prodotto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Quantità"
              value={row.quantity}
              onChange={(e) => updateRow(index, { quantity: e.target.value })}
              className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={row.optional}
                onChange={(e) => updateRow(index, { optional: e.target.checked })}
              />
              Opzionale
            </label>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
              className="text-sm font-medium text-red-600 disabled:opacity-40 dark:text-red-400"
            >
              Rimuovi
            </button>
          </div>
        ))}
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
        {submitting ? "Salvataggio..." : recipeId ? "Salva modifiche" : "Crea ricetta"}
      </button>
    </form>
  );
}
