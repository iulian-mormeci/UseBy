"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PendingSubmissionStatusActions({
  submissionId,
  status,
}: {
  submissionId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(newStatus: "INCLUDED" | "REJECTED") {
    setLoading(true);
    await fetch(`/api/pending-product-submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  if (status === "INCLUDED" || status === "REJECTED") return null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setStatus("INCLUDED")}
        disabled={loading}
        className="text-sm font-medium text-green-600 hover:underline disabled:opacity-50 dark:text-green-400"
      >
        Segna inclusa
      </button>
      <button
        type="button"
        onClick={() => setStatus("REJECTED")}
        disabled={loading}
        className="text-sm font-medium text-gray-500 hover:underline disabled:opacity-50 dark:text-gray-400"
      >
        Rifiuta
      </button>
    </div>
  );
}
