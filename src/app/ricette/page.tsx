import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  getStockQuantityByProduct,
  getEarliestExpiryByProduct,
  computeCookability,
  sortByPriority,
} from "@/lib/recipe-matching";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function RicettePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    stato?: string;
    productIds?: string | string[];
    matchMode?: string;
  }>;
}) {
  const { q, stato, productIds: productIdsRaw, matchMode } = await searchParams;
  const selectedProductIds = toArray(productIdsRaw).map(Number);
  const isExactMatch = matchMode === "all";

  const [recipes, stockByProduct, expiryByProduct, stockedProducts, admin, t, tCommon] =
    await Promise.all([
      prisma.recipe.findMany({
        where: {
          ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
          ...(selectedProductIds.length > 0
            ? { ingredients: { some: { productId: { in: selectedProductIds } } } }
            : {}),
        },
        orderBy: { title: "asc" },
        include: { ingredients: { include: { product: true } } },
      }),
      getStockQuantityByProduct(),
      getEarliestExpiryByProduct(),
      prisma.product.findMany({
        where: { stockItems: { some: {} } },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      isAdmin(),
      getTranslations("Ricette"),
      getTranslations("Common"),
    ]);

  const recipesMatchingSelection =
    selectedProductIds.length > 0 && isExactMatch
      ? recipes.filter((recipe) => {
          const recipeProductIds = new Set(recipe.ingredients.map((i) => i.productId));
          return selectedProductIds.every((id) => recipeProductIds.has(id));
        })
      : recipes;

  const withCookability = recipesMatchingSelection
    .map((recipe) => ({
      recipe,
      cookability: computeCookability(recipe, stockByProduct, expiryByProduct),
    }))
    .filter(({ cookability }) => (stato === "cucinabili" ? cookability.isCookable : true));

  const results = sortByPriority(withCookability);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        {admin && (
          <Link
            href="/ricette/nuovo"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            {t("addButton")}
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t("searchTitleLabel")}</span>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">{t("statusLabel")}</span>
            <select
              name="stato"
              defaultValue={stato ?? ""}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">{t("allStatuses")}</option>
              <option value="cucinabili">{t("cookableOnly")}</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
          >
            {tCommon("filter")}
          </button>
          <Link href="/ricette" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            {tCommon("reset")}
          </Link>
        </div>

        {stockedProducts.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
            <span className="text-sm font-medium">{t("stockSearchTitle")}</span>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {stockedProducts.map((product) => (
                <label key={product.id} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    name="productIds"
                    value={product.id}
                    defaultChecked={selectedProductIds.includes(product.id)}
                  />
                  {product.name}
                </label>
              ))}
            </div>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="matchMode"
                  value="any"
                  defaultChecked={matchMode !== "all"}
                />
                {t("matchAny")}
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" name="matchMode" value="all" defaultChecked={matchMode === "all"} />
                {t("matchAll")}
              </label>
            </div>
          </div>
        )}
      </form>

      {results.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noResults")}</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {results.map(({ recipe, cookability }) => (
            <li key={recipe.id} className="flex items-center justify-between gap-4 p-3">
              <div>
                <Link href={`/ricette/${recipe.id}`} className="font-medium hover:underline">
                  {recipe.title}
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("ingredientsCount", { count: recipe.ingredients.length })}
                  {recipe.servings ? ` · ${t("servingsCount", { count: recipe.servings })}` : ""}
                </div>
                {cookability.missingIngredientNames.length > 0 && (
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {t("missingIngredients", { names: cookability.missingIngredientNames.join(", ") })}
                  </div>
                )}
                {cookability.soonestExpiryDate && (
                  <div className="text-sm text-amber-600 dark:text-amber-400">
                    {t("expiringIngredients", {
                      date: cookability.soonestExpiryDate.toLocaleDateString(),
                    })}
                  </div>
                )}
              </div>
              {cookability.isCookable ? (
                <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t("cookableBadge")}
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  {cookability.missingCount === 1
                    ? t("missingBadgeOne")
                    : t("missingBadgeMany", { count: cookability.missingCount })}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
