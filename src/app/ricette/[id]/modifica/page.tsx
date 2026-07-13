import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/forms/RecipeForm";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function ModificaRicettaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [recipe, products] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id },
      include: { ingredients: true },
    }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!recipe) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Modifica ricetta</h1>
      <RecipeForm
        products={products}
        recipeId={recipe.id}
        initialData={{
          title: recipe.title,
          instructions: recipe.instructions,
          servings: recipe.servings,
          prepMinutes: recipe.prepMinutes,
          cookMinutes: recipe.cookMinutes,
          notes: recipe.notes,
          ingredients: recipe.ingredients.map((ingredient) => ({
            productId: ingredient.productId,
            quantity: ingredient.quantity === null ? null : String(ingredient.quantity),
            optional: ingredient.optional,
          })),
        }}
      />
    </div>
  );
}
