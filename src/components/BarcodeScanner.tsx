"use client";

import { useEffect, useRef, useState } from "react";

type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
};
type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => BarcodeDetectorLike;

export function BarcodeScanner({ onDetected }: { onDetected: (barcode: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");

  useEffect(() => {
    let stopped = false;
    let hasDetected = false;
    let stopFn: (() => void) | null = null;

    function reportDetected(value: string) {
      if (hasDetected) return;
      hasDetected = true;
      stopFn?.();
      onDetected(value);
    }

    async function startNativeDetector(video: HTMLVideoElement) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (stopped) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video.srcObject = stream;
      await video.play();

      const BarcodeDetectorCtor = (
        window as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
      ).BarcodeDetector;
      const detector = new BarcodeDetectorCtor({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
      });

      let rafId: number;
      const tick = async () => {
        if (stopped || hasDetected) return;
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0) {
            reportDetected(barcodes[0].rawValue);
            return;
          }
        } catch {
          // ignore transient per-frame detection errors, keep trying
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);

      stopFn = () => {
        cancelAnimationFrame(rafId);
        stream.getTracks().forEach((track) => track.stop());
      };
    }

    async function startZxingFallback(video: HTMLVideoElement) {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: "environment" } },
        video,
        (result) => {
          if (result) {
            reportDetected(result.getText());
          }
        },
      );
      stopFn = () => controls.stop();
    }

    async function start() {
      const video = videoRef.current;
      if (!video) return;

      try {
        if ("BarcodeDetector" in window) {
          await startNativeDetector(video);
        } else {
          await startZxingFallback(video);
        }
      } catch (error) {
        setCameraError(
          error instanceof Error
            ? `Fotocamera non disponibile: ${error.message}`
            : "Fotocamera non disponibile",
        );
      }
    }

    start();

    return () => {
      stopped = true;
      stopFn?.();
    };
  }, [onDetected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-800">
        <video ref={videoRef} className="aspect-video w-full" muted playsInline />
      </div>

      {cameraError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {cameraError}. Puoi comunque inserire il codice a barre manualmente qui sotto.
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (manualBarcode.trim()) onDetected(manualBarcode.trim());
        }}
        className="flex items-end gap-2"
      >
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Oppure inserisci il codice a barre</span>
          <input
            type="text"
            value={manualBarcode}
            onChange={(event) => setManualBarcode(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium dark:border-gray-700"
        >
          Cerca
        </button>
      </form>
    </div>
  );
}
