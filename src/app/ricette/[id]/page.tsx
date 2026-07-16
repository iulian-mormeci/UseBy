import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { parseId } from "@/lib/parse-id";
import {
  getStockQuantityByProduct,
  getEarliestExpiryByProduct,
  computeCookability,
} from "@/lib/recipe-matching";
import { DeleteButton } from "@/components/DeleteButton";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RicettaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [recipe, stockByProduct, expiryByProduct, admin, t, tCommon, tRicette] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: { include: { product: true } } },
    }),
    getStockQuantityByProduct(),
    getEarliestExpiryByProduct(),
    isAdmin(),
    getTranslations("RicettaDetail"),
    getTranslations("Common"),
    getTranslations("Ricette"),
  ]);

  if (!recipe) notFound();

  const cookability = computeCookability(recipe, stockByProduct, expiryByProduct);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{recipe.title}</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {[
              recipe.servings ? tRicette("servingsCount", { count: recipe.servings }) : null,
              recipe.prepMinutes ? t("prepTime", { minutes: recipe.prepMinutes }) : null,
              recipe.cookMinutes ? t("cookTime", { minutes: recipe.cookMinutes }) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        {admin && (
          <div className="flex items-center gap-3">
            <Link
              href={`/ricette/${recipe.id}/modifica`}
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {tCommon("edit")}
            </Link>
            <DeleteButton endpoint={`/api/recipes/${recipe.id}`} redirectTo="/ricette" />
          </div>
        )}
      </div>

      {cookability.isCookable ? (
        <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          {t("cookableMessage")}
        </span>
      ) : (
        <span className="inline-flex w-fit items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
          {cookability.missingCount === 1
            ? tRicette("missingBadgeOne")
            : tRicette("missingBadgeMany", { count: cookability.missingCount })}
        </span>
      )}

      {cookability.soonestExpiryDate && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("expiringHint", { date: cookability.soonestExpiryDate.toLocaleDateString() })}
        </p>
      )}

      <div>
        <h2 className="mb-2 font-medium">{t("ingredientsTitle")}</h2>
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {cookability.ingredients.map((ingredient) => (
            <li key={ingredient.productId} className="flex items-center justify-between gap-4 p-3 text-sm">
              <span>
                {ingredient.productName}
                {ingredient.optional ? (
                  <span className="ml-1 text-gray-400">({tCommon("optional")})</span>
                ) : null}
              </span>
              <span
                className={
                  ingredient.isMissing
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                {ingredient.requiredQuantity !== null
                  ? t("requiredAvailable", {
                      required: ingredient.requiredQuantity,
                      available: ingredient.availableQuantity,
                    })
                  : ingredient.availableQuantity > 0
                    ? t("available")
                    : t("notAvailable")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-medium">{t("instructionsTitle")}</h2>
        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {recipe.instructions}
        </p>
      </div>

      {recipe.notes && (
        <div>
          <h2 className="mb-2 font-medium">{t("notesTitle")}</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
            {recipe.notes}
          </p>
        </div>
      )}
    </div>
  );
}
