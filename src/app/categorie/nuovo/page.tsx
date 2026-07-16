import { getTranslations } from "next-intl/server";
import { CategoryForm } from "@/components/forms/CategoryForm";

export const dynamic = "force-dynamic";

export default async function NuovaCategoriaPage() {
  const t = await getTranslations("CategorieNuova");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <CategoryForm />
    </div>
  );
}
