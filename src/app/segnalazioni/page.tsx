import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { ReportStatusActions } from "@/components/ReportStatusActions";
import { missingProductReportStatusSchema } from "@/lib/validation/missing-product-report";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "In sospeso",
  RESOLVED: "Risolta",
  REJECTED: "Rifiutata",
};

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

  const reports = await prisma.missingProductReport.findMany({
    where: statusResult?.success ? { status: statusResult.data } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Segnalazioni prodotti mancanti</h1>
        <Link
          href="/segnalazioni/nuova"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          + Segnala prodotto
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Stato</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Tutte</option>
            <option value="PENDING">In sospeso</option>
            <option value="RESOLVED">Risolte</option>
            <option value="REJECTED">Rifiutate</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          Filtra
        </button>
        <Link href="/segnalazioni" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          Reimposta
        </Link>
      </form>

      {reports.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessuna segnalazione trovata.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">Prodotto richiesto</th>
                <th className="px-3 py-2 font-medium">Note</th>
                <th className="px-3 py-2 font-medium">Stato</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Azioni</th>
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
                      {STATUS_LABELS[report.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    {report.emailedAt ? "Inviata" : "Non inviata"}
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
