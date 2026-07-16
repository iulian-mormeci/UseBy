import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const t = await getTranslations("DispensaModifica");

  const [stockItem, products, locations, zones] = await Promise.all([
    prisma.stockItem.findUnique({ where: { id } }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, usageType: true, defaultUnit: true },
    }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.zone.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, locationId: true },
    }),
  ]);

  if (!stockItem) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <StockItemForm
        products={products}
        locations={locations}
        zones={zones}
        stockItemId={stockItem.id}
        initialData={{
          productId: stockItem.productId,
          locationId: stockItem.locationId,
          zoneId: stockItem.zoneId,
          quantity: String(stockItem.quantity),
          initialQuantity:
            stockItem.initialQuantity !== null ? String(stockItem.initialQuantity) : null,
          currentQuantity:
            stockItem.currentQuantity !== null ? String(stockItem.currentQuantity) : null,
          expiryDate: stockItem.expiryDate?.toISOString() ?? null,
          expiryType: stockItem.expiryType,
          leadDays: stockItem.leadDays,
          purchasedAt: stockItem.purchasedAt?.toISOString() ?? null,
          openedAt: stockItem.openedAt?.toISOString() ?? null,
          notes: stockItem.notes,
        }}
      />
    </div>
  );
}
