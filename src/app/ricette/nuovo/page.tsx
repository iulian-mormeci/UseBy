import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/forms/RecipeForm";

export const dynamic = "force-dynamic";

export default async function NuovaRicettaPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Aggiungi ricetta</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Non trovi un ingrediente?{" "}
          <Link href="/prodotti/nuovo" className="text-blue-600 hover:underline dark:text-blue-400">
            Aggiungilo al catalogo
          </Link>
          .
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Serve almeno un prodotto a catalogo prima di poter creare una ricetta.
        </p>
      ) : (
        <RecipeForm products={products} />
      )}
    </div>
  );
}
