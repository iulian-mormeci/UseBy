import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export type RecipeWithIngredients = Prisma.RecipeGetPayload<{
  include: { ingredients: { include: { product: true } } };
}>;

export type IngredientStatus = {
  productId: number;
  productName: string;
  requiredQuantity: number | null;
  availableQuantity: number;
  optional: boolean;
  isMissing: boolean;
};

export type RecipeCookability = {
  isCookable: boolean;
  missingCount: number;
  ingredients: IngredientStatus[];
  missingIngredientNames: string[];
  /** Earliest expiry date among this recipe's available (non-missing) ingredients, if any. */
  soonestExpiryDate: Date | null;
};

export async function getStockQuantityByProduct(): Promise<Map<number, number>> {
  const totals = await prisma.stockItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  });

  const stockByProduct = new Map<number, number>();
  for (const row of totals) {
    stockByProduct.set(row.productId, Number(row._sum.quantity ?? 0));
  }
  return stockByProduct;
}

export async function getEarliestExpiryByProduct(): Promise<Map<number, Date>> {
  const earliest = await prisma.stockItem.groupBy({
    by: ["productId"],
    where: { expiryDate: { not: null } },
    _min: { expiryDate: true },
  });

  const expiryByProduct = new Map<number, Date>();
  for (const row of earliest) {
    if (row._min.expiryDate) expiryByProduct.set(row.productId, row._min.expiryDate);
  }
  return expiryByProduct;
}

export function computeCookability(
  recipe: RecipeWithIngredients,
  stockByProduct: Map<number, number>,
  expiryByProduct: Map<number, Date>,
): RecipeCookability {
  const ingredients: IngredientStatus[] = recipe.ingredients.map((ingredient) => {
    const availableQuantity = stockByProduct.get(ingredient.productId) ?? 0;
    const requiredQuantity = ingredient.quantity === null ? null : Number(ingredient.quantity);
    const isMissing =
      !ingredient.optional &&
      (requiredQuantity === null ? availableQuantity <= 0 : availableQuantity < requiredQuantity);

    return {
      productId: ingredient.productId,
      productName: ingredient.product.name,
      requiredQuantity,
      availableQuantity,
      optional: ingredient.optional,
      isMissing,
    };
  });

  const missingCount = ingredients.filter((i) => i.isMissing).length;
  const missingIngredientNames = ingredients.filter((i) => i.isMissing).map((i) => i.productName);

  const availableExpiryDates = ingredients
    .filter((i) => !i.isMissing)
    .map((i) => expiryByProduct.get(i.productId))
    .filter((date): date is Date => date !== undefined);
  const soonestExpiryDate =
    availableExpiryDates.length > 0
      ? new Date(Math.min(...availableExpiryDates.map((d) => d.getTime())))
      : null;

  return {
    isCookable: missingCount === 0,
    missingCount,
    ingredients,
    missingIngredientNames,
    soonestExpiryDate,
  };
}

/**
 * Sorts cookability results so recipes using soon-to-expire stock surface first
 * (helps clear out what's about to go bad), falling back to fewest missing
 * ingredients, then title.
 */
export function sortByPriority<T extends { recipe: RecipeWithIngredients; cookability: RecipeCookability }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => {
    const aExpiry = a.cookability.soonestExpiryDate;
    const bExpiry = b.cookability.soonestExpiryDate;

    if (aExpiry && bExpiry) {
      const diff = aExpiry.getTime() - bExpiry.getTime();
      if (diff !== 0) return diff;
    } else if (aExpiry) {
      return -1;
    } else if (bExpiry) {
      return 1;
    }

    if (a.cookability.missingCount !== b.cookability.missingCount) {
      return a.cookability.missingCount - b.cookability.missingCount;
    }
    return a.recipe.title.localeCompare(b.recipe.title);
  });
}
