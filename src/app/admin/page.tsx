import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [pendingCount, t, tNav] = await Promise.all([
    prisma.pendingProductSubmission.count({
      where: { status: { in: ["PENDING", "EMAILED"] } },
    }),
    getTranslations("Admin"),
    getTranslations("Nav"),
  ]);

  const links = [
    { href: "/prodotti", label: tNav("prodotti"), hint: t("linkProductsHint") },
    { href: "/categorie", label: tNav("categorie"), hint: t("linkCategoriesHint") },
    { href: "/ubicazioni", label: tNav("ubicazioni"), hint: t("linkLocationsHint") },
    { href: "/ricette", label: tNav("ricette"), hint: t("linkRecipesHint") },
    { href: "/segnalazioni", label: tNav("segnalazioni"), hint: t("linkReportsHint") },
    {
      href: "/admin/segnalazioni-prodotti",
      label: t("linkPending"),
      hint: t("linkPendingHint", { count: pendingCount }),
    },
    { href: "/admin/impostazioni", label: t("linkSettings"), hint: t("linkSettingsHint") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <LogoutButton className="text-sm font-medium text-gray-500 hover:underline dark:text-gray-400" />
      </div>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <span className="font-medium">{link.label}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{link.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
