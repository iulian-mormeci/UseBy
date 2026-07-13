import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { createRecipeSchema } from "@/lib/validation/recipe";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const recipes = await prisma.recipe.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { title: "asc" },
    include: { ingredients: { include: { product: true } } },
  });
  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  try {
    const data = createRecipeSchema.parse(await request.json());
    const { ingredients, ...recipeData } = data;
    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: { create: ingredients },
      },
      include: { ingredients: { include: { product: true } } },
    });
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
