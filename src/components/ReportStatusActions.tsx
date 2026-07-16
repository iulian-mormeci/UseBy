"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ReportStatusActions({
  reportId,
  status,
}: {
  reportId: number;
  status: string;
}) {
  const router = useRouter();
  const t = useTranslations("ReportStatusActions");
  const [loading, setLoading] = useState(false);

  async function setStatus(newStatus: "RESOLVED" | "REJECTED") {
    setLoading(true);
    await fetch(`/api/missing-product-reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  if (status !== "PENDING") return null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setStatus("RESOLVED")}
        disabled={loading}
        className="text-sm font-medium text-green-600 hover:underline disabled:opacity-50 dark:text-green-400"
      >
        {t("markResolved")}
      </button>
      <button
        type="button"
        onClick={() => setStatus("REJECTED")}
        disabled={loading}
        className="text-sm font-medium text-gray-500 hover:underline disabled:opacity-50 dark:text-gray-400"
      >
        {t("reject")}
      </button>
    </div>
  );
}
