import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/forms/RecipeForm";

export const dynamic = "force-dynamic";

export default async function NuovaRicettaPage() {
  const [products, t] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    getTranslations("RicetteNuova"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noIngredientHint")}{" "}
          <Link href="/prodotti/nuovo" className="text-blue-600 hover:underline dark:text-blue-400">
            {t("addToCatalogLink")}
          </Link>
          .
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("needProduct")}</p>
      ) : (
        <RecipeForm products={products} />
      )}
    </div>
  );
}
