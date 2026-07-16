import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { ReportStatusActions } from "@/components/ReportStatusActions";
import { missingProductReportStatusSchema } from "@/lib/validation/missing-product-report";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default async function SegnalazioniPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusResult = status ? missingProductReportStatusSchema.safeParse(status) : null;
  const [t, tCommon] = await Promise.all([
    getTranslations("Segnalazioni"),
    getTranslations("Common"),
  ]);

  const statusLabels: Record<string, string> = {
    PENDING: t("statusPending"),
    RESOLVED: t("statusResolved"),
    REJECTED: t("statusRejected"),
  };

  const reports = await prisma.missingProductReport.findMany({
    where: statusResult?.success ? { status: statusResult.data } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <Link
          href="/segnalazioni/nuova"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          {t("addButton")}
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("statusLabel")}</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="PENDING">{t("statusPending")}</option>
            <option value="RESOLVED">{t("statusResolved")}</option>
            <option value="REJECTED">{t("statusRejected")}</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          {tCommon("filter")}
        </button>
        <Link href="/segnalazioni" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          {tCommon("reset")}
        </Link>
      </form>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noReportsFound")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">{t("colProduct")}</th>
                <th className="px-3 py-2 font-medium">{t("colNote")}</th>
                <th className="px-3 py-2 font-medium">{t("colStatus")}</th>
                <th className="px-3 py-2 font-medium">{t("colEmail")}</th>
                <th className="px-3 py-2 font-medium">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-3 py-2 font-medium">{report.requestedName}</td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {report.note ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[report.status]}`}
                    >
                      {statusLabels[report.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {report.emailedAt ? t("emailSent") : t("emailNotSent")}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <ReportStatusActions reportId={report.id} status={report.status} />
                      <DeleteButton endpoint={`/api/missing-product-reports/${report.id}`} />
                    </div>
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
