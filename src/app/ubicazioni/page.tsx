import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function UbicazioniPage() {
  const [locations, admin, t, tCommon, tLocationType] = await Promise.all([
    prisma.location.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { stockItems: true } } },
    }),
    isAdmin(),
    getTranslations("Ubicazioni"),
    getTranslations("Common"),
    getTranslations("LocationType"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        {admin && (
          <Link
            href="/ubicazioni/nuovo"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            {t("addButton")}
          </Link>
        )}
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noLocationsFound")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">{t("colName")}</th>
                <th className="px-3 py-2 font-medium">{t("colType")}</th>
                <th className="px-3 py-2 font-medium">{t("colProducts")}</th>
                {admin && <th className="px-3 py-2 font-medium">{t("colActions")}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-3 py-2 font-medium">{location.name}</td>
                  <td className="px-3 py-2">{tLocationType(location.type)}</td>
                  <td className="px-3 py-2">{location._count.stockItems}</td>
                  {admin && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/ubicazioni/${location.id}/modifica`}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {tCommon("edit")}
                        </Link>
                        <DeleteButton endpoint={`/api/locations/${location.id}`} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
