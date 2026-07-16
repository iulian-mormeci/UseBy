import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/forms/ProductForm";

export const dynamic = "force-dynamic";

export default async function NuovoProdottoPage() {
  const [categories, t] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getTranslations("ProdottiNuovo"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
