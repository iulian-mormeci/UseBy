import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocationForm } from "@/components/forms/LocationForm";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function ModificaUbicazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Modifica ubicazione</h1>
      <LocationForm
        locationId={location.id}
        initialData={{ name: location.name, type: location.type }}
      />
    </div>
  );
}
