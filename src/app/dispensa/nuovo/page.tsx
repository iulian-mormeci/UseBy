import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations("DispensaNuovo");

  const [products, locations, zones] = await Promise.all([
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noProductHint")}{" "}
          <Link href="/prodotti/nuovo" className="text-blue-600 hover:underline dark:text-blue-400">
            {t("addToCatalogLink")}
          </Link>{" "}
          {t("orText")}{" "}
          <Link href="/dispensa/scansiona" className="text-blue-600 hover:underline dark:text-blue-400">
            {t("scanLink")}
          </Link>
          .
        </p>
      </div>

      {products.length === 0 || locations.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("needProductAndLocation")}</p>
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
