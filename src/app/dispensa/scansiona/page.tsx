import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { ScanFlow } from "@/components/ScanFlow";

export const dynamic = "force-dynamic";

export default async function ScansionaPage() {
  const [categories, t] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getTranslations("DispensaScansiona"),
  ]);

  return (
    <div className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
      </div>
      <ScanFlow categories={categories} />
    </div>
  );
}
