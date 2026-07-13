import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StockItemForm } from "@/components/forms/StockItemForm";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function ModificaStockItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [stockItem, products, locations] = await Promise.all([
    prisma.stockItem.findUnique({ where: { id } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!stockItem) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Modifica prodotto in dispensa</h1>
      <StockItemForm
        products={products}
        locations={locations}
        stockItemId={stockItem.id}
        initialData={{
          productId: stockItem.productId,
          locationId: stockItem.locationId,
          quantity: String(stockItem.quantity),
          expiryDate: stockItem.expiryDate?.toISOString() ?? null,
          expiryType: stockItem.expiryType,
          purchasedAt: stockItem.purchasedAt?.toISOString() ?? null,
          openedAt: stockItem.openedAt?.toISOString() ?? null,
          notes: stockItem.notes,
        }}
      />
    </div>
  );
}
