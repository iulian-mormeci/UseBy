import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StockItemForm } from "@/components/forms/StockItemForm";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function NuovoStockItemPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const defaultProductId = productId ? (parseId(productId) ?? undefined) : undefined;

  const [products, locations, zones] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.zone.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, locationId: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Aggiungi prodotto in dispensa</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Non trovi il prodotto?{" "}
          <Link href="/prodotti/nuovo" className="text-blue-600 hover:underline dark:text-blue-400">
            Aggiungilo al catalogo
          </Link>{" "}
          o{" "}
          <Link href="/dispensa/scansiona" className="text-blue-600 hover:underline dark:text-blue-400">
            scansiona il codice a barre
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
        <StockItemForm
          products={products}
          locations={locations}
          zones={zones}
          defaultProductId={defaultProductId}
        />
      )}
    </div>
  );
}
