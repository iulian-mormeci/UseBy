"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ProductForm } from "@/components/forms/ProductForm";

type Category = { id: number; name: string };

type LocalProduct = {
  id: number;
  name: string;
  brand: string | null;
  imageUrl: string | null;
};

type OffProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
};

type Step =
  | { kind: "scanning" }
  | { kind: "loading" }
  | { kind: "found_local"; product: LocalProduct }
  | { kind: "found_off"; product: OffProduct }
  | { kind: "not_found"; barcode: string }
  | { kind: "submitted"; product: { id: number; name: string } }
  | { kind: "error"; message: string };

export function ScanFlow({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const t = useTranslations("ScanFlow");
  const [step, setStep] = useState<Step>({ kind: "scanning" });

  async function handleDetected(barcode: string) {
    setStep({ kind: "loading" });

    try {
      const res = await fetch(`/api/products/lookup?barcode=${encodeURIComponent(barcode)}`);
      if (!res.ok) {
        setStep({ kind: "error", message: t("searchError") });
        return;
      }
      const data = await res.json();

      if (data.source === "local") {
        setStep({ kind: "found_local", product: data.product });
      } else if (data.source === "openfoodfacts") {
        setStep({ kind: "found_off", product: data.product });
      } else {
        setStep({ kind: "not_found", barcode });
      }
    } catch {
      setStep({ kind: "error", message: t("searchError") });
    }
  }

  function reset() {
    setStep({ kind: "scanning" });
  }

  if (step.kind === "scanning") {
    return <BarcodeScanner onDetected={handleDetected} />;
  }

  if (step.kind === "loading") {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t("searching")}</p>;
  }

  if (step.kind === "error") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-red-600 dark:text-red-400">{step.message}</p>
        <button
          onClick={reset}
          className="w-fit rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (step.kind === "found_local") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          {step.product.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={step.product.imageUrl}
              alt={step.product.name}
              className="h-16 w-16 rounded-md object-cover"
            />
          )}
          <div>
            <div className="font-medium">{step.product.name}</div>
            {step.product.brand && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{step.product.brand}</div>
            )}
            <div className="text-sm text-green-600 dark:text-green-400">{t("alreadyInCatalog")}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/dispensa/nuovo?productId=${step.product.id}`)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
          >
            {t("addToStock")}
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
          >
            {t("scanAnother")}
          </button>
        </div>
      </div>
    );
  }

  if (step.kind === "found_off") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("foundOnOff")}</p>
        <ProductForm
          categories={categories}
          lockedBarcode={step.product.barcode}
          initialData={{
            name: step.product.name,
            brand: step.product.brand,
            imageUrl: step.product.imageUrl,
          }}
          onSuccess={(product) => router.push(`/dispensa/nuovo?productId=${product.id}`)}
        />
        <button
          onClick={reset}
          className="w-fit text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
        >
          {t("cancelScanAnother")}
        </button>
      </div>
    );
  }

  if (step.kind === "not_found") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("notFoundHint")}</p>
        <ProductForm
          categories={categories}
          mode="pending-submission"
          lockedBarcode={step.barcode}
          onSuccess={(product) => setStep({ kind: "submitted", product })}
        />
        <button
          onClick={reset}
          className="w-fit text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
        >
          {t("cancelScanAnother")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-green-700 dark:text-green-400">
        {t("submittedMessage", { name: step.product.name })}
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/dispensa/nuovo?productId=${step.product.id}`)}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
        >
          {t("addToStock")}
        </button>
        <button
          onClick={reset}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
        >
          {t("scanAnother")}
        </button>
      </div>
    </div>
  );
}
