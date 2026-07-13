import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { LOCATION_TYPE_LABELS } from "@/lib/location-labels";

export const dynamic = "force-dynamic";

export default async function UbicazioniPage() {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stockItems: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ubicazioni</h1>
        <Link
          href="/ubicazioni/nuovo"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          + Aggiungi ubicazione
        </Link>
      </div>

      {locations.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessuna ubicazione creata.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Prodotti</th>
                <th className="px-3 py-2 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-3 py-2 font-medium">{location.name}</td>
                  <td className="px-3 py-2">{LOCATION_TYPE_LABELS[location.type]}</td>
                  <td className="px-3 py-2">{location._count.stockItems}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/ubicazioni/${location.id}/modifica`}
                        className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Modifica
                      </Link>
                      <DeleteButton endpoint={`/api/locations/${location.id}`} />
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
