import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/forms/ProductForm";

export const dynamic = "force-dynamic";

export default async function NuovoProdottoPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Aggiungi prodotto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
