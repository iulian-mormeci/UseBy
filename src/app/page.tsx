import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExpiryBadge } from "@/components/ExpiryBadge";
import { LOCATION_TYPE_LABELS } from "@/lib/location-labels";
import { isExpired, isExpiringSoon } from "@/lib/expiry";
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

function groupByLocationAndZone(items: StockItemWithRelations[]) {
  const byLocation = new Map<
    number,
    { location: StockItemWithRelations["location"]; zoneGroups: Map<string, StockItemWithRelations[]> }
  >();

  for (const item of items) {
    if (!byLocation.has(item.locationId)) {
      byLocation.set(item.locationId, { location: item.location, zoneGroups: new Map() });
    }
    const entry = byLocation.get(item.locationId)!;
    const zoneName = item.zone?.name ?? "Senza zona";
    if (!entry.zoneGroups.has(zoneName)) {
      entry.zoneGroups.set(zoneName, []);
    }
    entry.zoneGroups.get(zoneName)!.push(item);
  }

  return Array.from(byLocation.values()).sort((a, b) => a.location.name.localeCompare(b.location.name));
}

function StockItemRow({ item }: { item: StockItemWithRelations }) {
  return (
    <li className="flex items-center justify-between gap-4 p-3 text-sm">
      <div>
        <Link href={`/dispensa/${item.id}/modifica`} className="font-medium hover:underline">
          {item.product.name}
        </Link>
        <div className="text-gray-500 dark:text-gray-400">
          {String(item.quantity)} {item.product.unit.toLowerCase()}
        </div>
      </div>
      <ExpiryBadge expiryDate={item.expiryDate} />
    </li>
  );
}

export default async function DashboardPage() {
  const [stockItems, notificationSetting] = await Promise.all([
    prisma.stockItem.findMany({
      orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      include: { product: true, location: true, zone: true },
    }),
    prisma.notificationSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
  ]);

  const defaultLeadDays = notificationSetting.defaultLeadDays;

  const expiringItems = stockItems.filter((item) =>
    isExpiringSoon(item.expiryDate, item.leadDays, defaultLeadDays),
  );
  const expiredCount = stockItems.filter((item) => isExpired(item.expiryDate)).length;
  const groupedByLocation = groupByLocationAndZone(stockItems);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Situazione di dispensa, frigo e congelatore.
        </p>
      </div>

      <div className="flex gap-4">
        <StatCard label="Prodotti in dispensa" value={stockItems.length} href="/dispensa" />
        <StatCard label="Scaduti" value={expiredCount} href="/dispensa?stato=scaduti" />
        <StatCard
          label="In scadenza"
          value={expiringItems.length}
          href="/dispensa?stato=in-scadenza"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">In scadenza</h2>
          <Link href="/dispensa/nuovo" className="text-sm font-medium text-blue-600 dark:text-blue-400">
            + Aggiungi prodotto
          </Link>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Preavviso: {defaultLeadDays} giorni (default), sovrascrivibile per singolo prodotto.
        </p>

        {expiringItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nessun prodotto in scadenza al momento.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {expiringItems.map((item) => (
              <StockItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-medium">Panoramica per reparto</h2>

        {groupedByLocation.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nessuna ubicazione con prodotti in dispensa.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedByLocation.map(({ location, zoneGroups }) => (
              <div key={location.id} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">
                  {location.name}{" "}
                  <span className="font-normal text-gray-500 dark:text-gray-400">
                    ({LOCATION_TYPE_LABELS[location.type]})
                  </span>
                </h3>
                <div className="flex flex-col gap-4 pl-4">
                  {Array.from(zoneGroups.entries()).map(([zoneName, items]) => (
                    <div key={zoneName}>
                      <h4 className="mb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        {zoneName}
                      </h4>
                      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                        {items.map((item) => (
                          <StockItemRow key={item.id} item={item} />
                        ))}
                      </ul>
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
