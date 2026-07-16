import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { isExpired, isExpiringSoon } from "@/lib/expiry";
import { ProductCard } from "@/components/ProductCard";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type StockItemWithRelations = Prisma.StockItemGetPayload<{
  include: { product: true; location: true; zone: true };
}>;

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="flex-1 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
    >
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </Link>
  );
}

function groupByLocationAndZone(items: StockItemWithRelations[], noZoneLabel: string) {
  const byLocation = new Map<
    number,
    { location: StockItemWithRelations["location"]; zoneGroups: Map<string, StockItemWithRelations[]> }
  >();

  for (const item of items) {
    if (!byLocation.has(item.locationId)) {
      byLocation.set(item.locationId, { location: item.location, zoneGroups: new Map() });
    }
    const entry = byLocation.get(item.locationId)!;
    const zoneName = item.zone?.name ?? noZoneLabel;
    if (!entry.zoneGroups.has(zoneName)) {
      entry.zoneGroups.set(zoneName, []);
    }
    entry.zoneGroups.get(zoneName)!.push(item);
  }

  return Array.from(byLocation.values()).sort((a, b) => a.location.name.localeCompare(b.location.name));
}

function ProductCardGrid({ items, subtitle }: { items: StockItemWithRelations[]; subtitle?: (item: StockItemWithRelations) => string }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          stockItemId={item.id}
          productName={item.product.name}
          imageUrl={item.product.imageUrl}
          usageType={item.product.usageType}
          currentQuantity={item.currentQuantity !== null ? Number(item.currentQuantity) : null}
          initialQuantity={item.initialQuantity !== null ? Number(item.initialQuantity) : null}
          unit={item.product.defaultUnit}
          expiryDate={item.expiryDate}
          subtitle={subtitle?.(item)}
        />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const [stockItems, notificationSetting, t, tLocationType] = await Promise.all([
    prisma.stockItem.findMany({
      orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      include: { product: true, location: true, zone: true },
    }),
    prisma.notificationSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
    getTranslations("Dashboard"),
    getTranslations("LocationType"),
  ]);

  const defaultLeadDays = notificationSetting.defaultLeadDays;

  const expiringItems = stockItems.filter((item) =>
    isExpiringSoon(item.expiryDate, item.leadDays, defaultLeadDays),
  );
  const expiredCount = stockItems.filter((item) => isExpired(item.expiryDate)).length;
  const groupedByLocation = groupByLocationAndZone(stockItems, t("noZoneLabel"));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>

      <div className="flex gap-4">
        <StatCard label={t("statTotal")} value={stockItems.length} href="/dispensa" />
        <StatCard label={t("statExpired")} value={expiredCount} href="/dispensa?stato=scaduti" />
        <StatCard
          label={t("statExpiring")}
          value={expiringItems.length}
          href="/dispensa?stato=in-scadenza"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">{t("expiringTitle")}</h2>
          <Link href="/dispensa/nuovo" className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {t("addProduct")}
          </Link>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          {t("leadDaysHint", { days: defaultLeadDays })}
        </p>

        {expiringItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("noExpiringItems")}</p>
        ) : (
          <ProductCardGrid items={expiringItems} subtitle={(item) => item.location.name} />
        )}
      </div>

      <div>
        <h2 className="mb-3 font-medium">{t("overviewTitle")}</h2>

        {groupedByLocation.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("noLocations")}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedByLocation.map(({ location, zoneGroups }) => (
              <div key={location.id} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">
                  {location.name}{" "}
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    ({tLocationType(location.type)})
                  </span>
                </h3>
                <div className="flex flex-col gap-4 pl-4">
                  {Array.from(zoneGroups.entries()).map(([zoneName, items]) => (
                    <div key={zoneName}>
                      <h4 className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        {zoneName}
                      </h4>
                      <ProductCardGrid items={items} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
