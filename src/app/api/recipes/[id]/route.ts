import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { parseId } from "@/lib/parse-id";
import { updateRecipeSchema } from "@/lib/validation/recipe";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: { include: { product: true } } },
  });
  if (!recipe) return jsonError("Ricetta non trovata", 404);

  return NextResponse.json(recipe);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    const data = updateRecipeSchema.parse(await request.json());
    const { ingredients, ...recipeData } = data;

    const recipe = await prisma.$transaction(async (tx) => {
      if (ingredients) {
        await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      }
      return tx.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          ...(ingredients ? { ingredients: { create: ingredients } } : {}),
        },
        include: { ingredients: { include: { product: true } } },
      });
    });

    return NextResponse.json(recipe);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const id = parseId((await params).id);
  if (id === null) return jsonError("ID non valido", 400);

  try {
    await prisma.recipe.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
