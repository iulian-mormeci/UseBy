import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/forms/ProductForm";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function ModificaProdottoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Modifica prodotto</h1>
      <ProductForm
        categories={categories}
        productId={product.id}
        initialData={{
          name: product.name,
          barcode: product.barcode,
          unit: product.unit,
          defaultShelfLifeDays: product.defaultShelfLifeDays,
          categoryId: product.categoryId,
        }}
      />
    </div>
  );
}
