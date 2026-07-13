import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ExpiryBadge } from "@/components/ExpiryBadge";

export const dynamic = "force-dynamic";

const SOON_DAYS = 7;

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

export default async function DashboardPage() {
  const now = new Date();
  const soonThreshold = new Date(now.getTime() + SOON_DAYS * 24 * 3600 * 1000);

  const [totalCount, expiredCount, soonCount, soonItems] = await Promise.all([
    prisma.stockItem.count(),
    prisma.stockItem.count({ where: { expiryDate: { lt: now } } }),
    prisma.stockItem.count({ where: { expiryDate: { gte: now, lte: soonThreshold } } }),
    prisma.stockItem.findMany({
      where: { expiryDate: { lte: soonThreshold } },
      orderBy: { expiryDate: "asc" },
      take: 10,
      include: { product: true, location: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Situazione di dispensa, frigo e congelatore.
        </p>
      </div>

      <div className="flex gap-4">
        <StatCard label="Prodotti in dispensa" value={totalCount} href="/dispensa" />
        <StatCard label="Scaduti" value={expiredCount} href="/dispensa?stato=scaduti" />
        <StatCard
          label={`In scadenza (${SOON_DAYS}gg)`}
          value={soonCount}
          href="/dispensa?stato=in-scadenza"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">In scadenza a breve</h2>
          <Link href="/dispensa/nuovo" className="text-sm font-medium text-blue-600 dark:text-blue-400">
            + Aggiungi prodotto
          </Link>
        </div>

        {soonItems.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nessun prodotto in scadenza nei prossimi {SOON_DAYS} giorni.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {soonItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 p-3">
                <div>
                  <Link href={`/dispensa/${item.id}/modifica`} className="font-medium hover:underline">
                    {item.product.name}
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.location.name} · {String(item.quantity)} {item.product.unit.toLowerCase()}
                  </div>
                </div>
                <ExpiryBadge expiryDate={item.expiryDate} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
