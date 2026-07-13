import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LocationForm } from "@/components/forms/LocationForm";
import { ZoneManager } from "@/components/ZoneManager";
import { parseId } from "@/lib/parse-id";

export const dynamic = "force-dynamic";

export default async function ModificaUbicazionePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseId((await params).id);
  if (id === null) notFound();

  const [location, zones] = await Promise.all([
    prisma.location.findUnique({ where: { id } }),
    prisma.zone.findMany({ where: { locationId: id }, orderBy: { name: "asc" } }),
  ]);

  if (!location) notFound();

  return (
    <div className="flex max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold">Modifica ubicazione</h1>
        <LocationForm
          locationId={location.id}
          initialData={{ name: location.name, type: location.type }}
        />
      </div>

      <ZoneManager locationId={location.id} zones={zones} />
    </div>
  );
}
