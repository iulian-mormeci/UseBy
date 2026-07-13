import { prisma } from "@/lib/prisma";
import { ScanFlow } from "@/components/ScanFlow";

export const dynamic = "force-dynamic";

export default async function ScansionaPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Scansiona codice a barre</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Inquadra il codice a barre del prodotto con la fotocamera, oppure inseriscilo
          manualmente.
        </p>
      </div>
      <ScanFlow categories={categories} />
    </div>
  );
}
