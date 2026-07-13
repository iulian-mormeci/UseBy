const DAY_MS = 24 * 60 * 60 * 1000;

type ExpiryStatus = "none" | "expired" | "urgent" | "soon" | "ok";

function getExpiryStatus(expiryDate: Date | null): ExpiryStatus {
  if (!expiryDate) return "none";
  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / DAY_MS);
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 2) return "urgent";
  if (daysLeft <= 6) return "soon";
  return "ok";
}

const STYLES: Record<ExpiryStatus, string> = {
  none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  urgent: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ok: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

function formatLabel(expiryDate: Date | null, status: ExpiryStatus): string {
  if (!expiryDate) return "Nessuna scadenza";
  const formatted = expiryDate.toLocaleDateString("it-IT");
  if (status === "expired") return `Scaduto il ${formatted}`;
  return formatted;
}

export function ExpiryBadge({ expiryDate }: { expiryDate: Date | null }) {
  const status = getExpiryStatus(expiryDate);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {formatLabel(expiryDate, status)}
    </span>
  );
}
