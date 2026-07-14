import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProdottiPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; q?: string }>;
}) {
  const { categoryId, q } = await searchParams;
  const admin = await isAdmin();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
      include: { category: true, _count: { select: { stockItems: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Prodotti</h1>
        <Link
          href="/prodotti/nuovo"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          + Aggiungi prodotto
        </Link>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Non trovi un prodotto?{" "}
        <Link href="/segnalazioni/nuova" className="text-blue-600 hover:underline dark:text-blue-400">
          Segnalalo
        </Link>
        .
      </p>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Cerca</span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Categoria</span>
          <select
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Tutte</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          Filtra
        </button>
        <Link href="/prodotti" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          Reimposta
        </Link>
      </form>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessun prodotto trovato.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Nome</th>
                <th className="px-3 py-2 font-medium">Categoria</th>
                <th className="px-3 py-2 font-medium">Unità</th>
                <th className="px-3 py-2 font-medium">In dispensa</th>
                <th className="px-3 py-2 font-medium">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-2 font-medium">{product.name}</td>
                  <td className="px-3 py-2">{product.category?.name ?? "—"}</td>
                  <td className="px-3 py-2">{product.unit.toLowerCase()}</td>
                  <td className="px-3 py-2">{product._count.stockItems}</td>
                  <td className="px-3 py-2">
                    {admin && (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/prodotti/${product.id}/modifica`}
                          className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Modifica
                        </Link>
                        <DeleteButton endpoint={`/api/products/${product.id}`} />
                      </div>
                    )}
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
