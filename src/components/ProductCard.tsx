"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { QuantityIndicator } from "@/components/QuantityIndicator";
import { ExpiryBadge } from "@/components/ExpiryBadge";

type UsageType = "PACK" | "WEIGHT" | "QUANTITY" | "VOLUME";

/**
 * Reusable product/stock-item card: image with a remaining-quantity overlay
 * (see QuantityIndicator) plus name, subtitle (e.g. location) and expiry
 * badge. Used on the dashboard; safe to reuse in any other product view.
 */
export function ProductCard({
  stockItemId,
  productName,
  imageUrl,
  usageType,
  currentQuantity,
  initialQuantity,
  unit,
  expiryDate,
  subtitle,
}: {
  stockItemId: number;
  productName: string;
  imageUrl: string | null;
  usageType: UsageType;
  currentQuantity: number | null;
  initialQuantity: number | null;
  unit: string;
  expiryDate: Date | null;
  subtitle?: string;
}) {
  const t = useTranslations("ProductCard");

  return (
    <Link
      href={`/dispensa/${stockItemId}/modifica`}
      className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
    >
      <div className="relative h-28 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            {t("noImage")}
          </div>
        )}
        <QuantityIndicator
          usageType={usageType}
          currentQuantity={currentQuantity}
          initialQuantity={initialQuantity}
          unit={unit}
        />
      </div>
      <div>
        <div className="truncate text-sm font-medium">{productName}</div>
        {subtitle && (
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
        )}
      </div>
      <ExpiryBadge expiryDate={expiryDate} />
    </Link>
  );
}
