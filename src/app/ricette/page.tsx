import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStockQuantityByProduct, computeCookability } from "@/lib/recipe-matching";

export const dynamic = "force-dynamic";

export default async function RicettePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stato?: string }>;
}) {
  const { q, stato } = await searchParams;

  const [recipes, stockByProduct] = await Promise.all([
    prisma.recipe.findMany({
      where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { title: "asc" },
      include: { ingredients: { include: { product: true } } },
    }),
    getStockQuantityByProduct(),
  ]);

  const recipesWithCookability = recipes
    .map((recipe) => ({ recipe, cookability: computeCookability(recipe, stockByProduct) }))
    .filter(({ cookability }) => (stato === "cucinabili" ? cookability.isCookable : true));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ricette</h1>
        <Link
          href="/ricette/nuovo"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          + Aggiungi ricetta
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Cerca</span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Stato</span>
          <select
            name="stato"
            defaultValue={stato ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Tutte</option>
            <option value="cucinabili">Solo cucinabili ora</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          Filtra
        </button>
        <Link href="/ricette" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          Reimposta
        </Link>
      </form>

      {recipesWithCookability.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessuna ricetta trovata.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {recipesWithCookability.map(({ recipe, cookability }) => (
            <li key={recipe.id} className="flex items-center justify-between gap-4 p-3">
              <div>
                <Link href={`/ricette/${recipe.id}`} className="font-medium hover:underline">
                  {recipe.title}
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {recipe.ingredients.length} ingredienti
                  {recipe.servings ? ` · ${recipe.servings} porzioni` : ""}
                </div>
              </div>
              {cookability.isCookable ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Puoi cucinarla
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  {cookability.missingCount === 1
                    ? "Manca 1 ingrediente"
                    : `Mancano ${cookability.missingCount} ingredienti`}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
