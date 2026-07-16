import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { DeleteButton } from "@/components/DeleteButton";
import { PendingSubmissionStatusActions } from "@/components/PendingSubmissionStatusActions";
import { pendingProductSubmissionStatusSchema } from "@/lib/validation/pending-product-submission";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  EMAILED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  INCLUDED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default async function SegnalazioniProdottiPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusResult = status ? pendingProductSubmissionStatusSchema.safeParse(status) : null;
  const [t, tCommon] = await Promise.all([
    getTranslations("AdminPendingSubmissions"),
    getTranslations("Common"),
  ]);

  const statusLabels: Record<string, string> = {
    PENDING: t("statusPending"),
    EMAILED: t("statusEmailed"),
    INCLUDED: t("statusIncluded"),
    REJECTED: t("statusRejected"),
  };

  const submissions = await prisma.pendingProductSubmission.findMany({
    where: statusResult?.success ? { status: statusResult.data } : undefined,
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("subtitle")}</p>
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
            <option value="EMAILED">{t("statusEmailed")}</option>
            <option value="INCLUDED">{t("statusIncluded")}</option>
            <option value="REJECTED">{t("statusRejected")}</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          {tCommon("filter")}
        </button>
        <Link
          href="/admin/segnalazioni-prodotti"
          className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {tCommon("reset")}
        </Link>
      </form>

      {submissions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("noneFound")}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2 font-medium">{t("colProduct")}</th>
                <th className="px-3 py-2 font-medium">{t("colBarcode")}</th>
                <th className="px-3 py-2 font-medium">{t("colStatus")}</th>
                <th className="px-3 py-2 font-medium">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-3 py-2 font-medium">
                    <Link
                      href={`/prodotti/${submission.productId}/modifica`}
                      className="hover:underline"
                    >
                      {submission.product.name}
                    </Link>
                    {submission.product.brand && (
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {submission.product.brand}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{submission.barcode}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[submission.status]}`}
                    >
                      {statusLabels[submission.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <PendingSubmissionStatusActions
                        submissionId={submission.id}
                        status={submission.status}
                      />
                      <DeleteButton endpoint={`/api/pending-product-submissions/${submission.id}`} />
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
