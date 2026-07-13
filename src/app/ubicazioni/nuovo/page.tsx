import { LocationForm } from "@/components/forms/LocationForm";

export default function NuovaUbicazionePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Aggiungi ubicazione</h1>
      <LocationForm />
    </div>
  );
}
