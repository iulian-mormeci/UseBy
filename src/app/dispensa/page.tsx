import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ExpiryBadge } from "@/components/ExpiryBadge";
import { DeleteButton } from "@/components/DeleteButton";
import { isExpired, isExpiringSoon } from "@/lib/expiry";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function DispensaPage({
  searchParams,
}: {
  searchParams: Promise<{ locationId?: string; stato?: string }>;
}) {
  const { locationId, stato } = await searchParams;
  const [t, tCommon] = await Promise.all([
    getTranslations("Dispensa"),
    getTranslations("Common"),
  ]);

  const where: Prisma.StockItemWhereInput = {
    ...(locationId ? { locationId: Number(locationId) } : {}),
  };

  const [allMatchingItems, locations, notificationSetting] = await Promise.all([
    prisma.stockItem.findMany({
      where,
      orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      include: { product: true, location: true, zone: true },
    }),
    prisma.location.findMany({ orderBy: { name: "asc" } }),
    prisma.notificationSetting.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
  ]);

  const stockItems = allMatchingItems.filter((item) => {
    if (stato === "scaduti") return isExpired(item.expiryDate);
    if (stato === "in-scadenza") {
      return isExpiringSoon(item.expiryDate, item.leadDays, notificationSetting.defaultLeadDays);
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dispensa/scansiona"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium dark:border-gray-700"
          >
            {t("scanButton")}
          </Link>
          <Link
            href="/dispensa/nuovo"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            {t("addButton")}
          </Link>
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("locationLabel")}</span>
          <select
            name="locationId"
            defaultValue={locationId ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">{t("allLocations")}</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("statusLabel")}</span>
          <select
            name="stato"
            defaultValue={stato ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="in-scadenza">{t("statusExpiring")}</option>
            <option value="scaduti">{t("statusExpired")}</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          {tCommon("filter")}
        </button>
        <Link href="/dispensa" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          {tCommon("reset")}
        </Link>
      </form>

      {stockItems.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noItemsFound")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">{t("colProduct")}</th>
                <th className="px-3 py-2 font-medium">{t("colLocation")}</th>
                <th className="px-3 py-2 font-medium">{t("colZone")}</th>
                <th className="px-3 py-2 font-medium">{t("colQuantity")}</th>
                <th className="px-3 py-2 font-medium">{t("colExpiry")}</th>
                <th className="px-3 py-2 font-medium">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {stockItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 font-medium">{item.product.name}</td>
                  <td className="px-3 py-2">{item.location.name}</td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {item.zone?.name ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    {String(item.quantity)} {item.product.unit.toLowerCase()}
                  </td>
                  <td className="px-3 py-2">
                    <ExpiryBadge expiryDate={item.expiryDate} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dispensa/${item.id}/modifica`}
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {tCommon("edit")}
                      </Link>
                      <DeleteButton endpoint={`/api/stock-items/${item.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
