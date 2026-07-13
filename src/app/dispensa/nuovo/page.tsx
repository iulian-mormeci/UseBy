import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StockItemForm } from "@/components/forms/StockItemForm";

export const dynamic = "force-dynamic";

export default async function NuovoStockItemPage() {
  const [products, locations] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Aggiungi prodotto in dispensa</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Non trovi il prodotto?{" "}
          <Link href="/prodotti/nuovo" className="text-blue-600 hover:underline dark:text-blue-400">
            Aggiungilo al catalogo
          </Link>
          .
        </p>
      </div>

      {products.length === 0 || locations.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Servono almeno un prodotto e un&apos;ubicazione prima di poter aggiungere un elemento in
          dispensa.
        </p>
      ) : (
        <StockItemForm products={products} locations={locations} />
      )}
    </div>
  );
}
