import { MissingProductReportForm } from "@/components/forms/MissingProductReportForm";

export default function NuovaSegnalazionePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Segnala prodotto mancante</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Non trovi un prodotto nel catalogo? Segnalalo: riceveremo una notifica via email.
        </p>
      </div>
      <MissingProductReportForm />
    </div>
  );
}
