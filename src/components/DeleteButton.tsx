"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DeleteButton({
  endpoint,
  confirmMessage,
  redirectTo,
}: {
  endpoint: string;
  confirmMessage?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const t = useTranslations("DeleteButton");
  const tCommon = useTranslations("Common");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!window.confirm(confirmMessage ?? t("confirmDefault"))) return;
    setLoading(true);
    setError(null);

    const res = await fetch(endpoint, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? t("error"));
      setLoading(false);
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {loading ? "..." : tCommon("delete")}
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
