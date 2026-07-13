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

export function computeCookability(
  recipe: RecipeWithIngredients,
  stockByProduct: Map<number, number>,
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

  return { isCookable: missingCount === 0, missingCount, ingredients };
}
