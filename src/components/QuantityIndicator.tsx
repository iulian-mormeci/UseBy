"use client";

import { useTranslations } from "next-intl";

type UsageType = "PACK" | "WEIGHT" | "QUANTITY" | "VOLUME";
type PackStepKey = "full" | "partial" | "nearlyEmpty" | "empty";

const PACK_STEP_BLOCKS: Record<PackStepKey, number> = {
  full: 4,
  partial: 3,
  nearlyEmpty: 1,
  empty: 0,
};

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function packStep(percent: number): PackStepKey {
  if (percent >= 75) return "full";
  if (percent >= 40) return "partial";
  if (percent >= 10) return "nearlyEmpty";
  return "empty";
}

/**
 * Overlay meant to sit inside a `relative` image container (see ProductCard).
 * Renders a different remaining-quantity visualization depending on usageType:
 * a continuous fill for WEIGHT/VOLUME, a stepped fill + label for PACK, and a
 * pieces-remaining badge for QUANTITY.
 */
export function QuantityIndicator({
  usageType,
  currentQuantity,
  initialQuantity,
  unit,
}: {
  usageType: UsageType;
  currentQuantity: number | null;
  initialQuantity: number | null;
  unit: string;
}) {
  const t = useTranslations("QuantityIndicator");

  const hasData = initialQuantity !== null && initialQuantity > 0 && currentQuantity !== null;
  const percent = hasData ? clampPercent((currentQuantity! / initialQuantity!) * 100) : null;

  if (!hasData || percent === null) {
    return (
      <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
        {t("noData")}
      </span>
    );
  }

  if (usageType === "QUANTITY") {
    return (
      <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
        {t("piecesRemaining", { current: currentQuantity, initial: initialQuantity })}
      </span>
    );
  }

  if (usageType === "PACK") {
    const step = packStep(percent);
    const litBlocks = PACK_STEP_BLOCKS[step];

    return (
      <>
        <div className="absolute inset-0 flex flex-col-reverse gap-0.5 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${i < litBlocks ? "bg-amber-400/60" : "bg-black/10"}`}
            />
          ))}
        </div>
        <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
          {t(step)}
        </span>
      </>
    );
  }

  // WEIGHT / VOLUME: continuous fill from the bottom, like a level gauge.
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 bg-blue-500/40" style={{ height: `${percent}%` }} />
      <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-semibold text-white">
        {Math.round(currentQuantity!)} {unit}
      </span>
    </>
  );
}
