import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CategoriePage() {
  const [categories, admin] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    isAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorie</h1>
        {admin && (
          <Link
            href="/categorie/nuovo"
            className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            + Aggiungi categoria
          </Link>
        )}
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessuna categoria creata.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Prodotti</th>
                {admin && <th className="px-3 py-2 font-medium">Azioni</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-3 py-2 font-medium">{category.name}</td>
                  <td className="px-3 py-2">{category._count.products}</td>
                  {admin && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/categorie/${category.id}/modifica`}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Modifica
                        </Link>
                        <DeleteButton endpoint={`/api/categories/${category.id}`} />
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
