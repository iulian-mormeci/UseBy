import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function ModificaCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [category, t] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    getTranslations("CategorieModifica"),
  ]);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <CategoryForm categoryId={category.id} initialName={category.name} />
    </div>
  );
}
