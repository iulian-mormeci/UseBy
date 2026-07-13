import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { createZoneSchema } from "@/lib/validation/zone";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");

  const zones = await prisma.zone.findMany({
    where: locationId ? { locationId: Number(locationId) } : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(zones);
}

export async function POST(request: NextRequest) {
  try {
    const data = createZoneSchema.parse(await request.json());
    const zone = await prisma.zone.create({ data });
    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
