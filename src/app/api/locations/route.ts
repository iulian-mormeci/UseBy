import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { createLocationSchema } from "@/lib/validation/location";

export async function GET() {
  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { stockItems: true } } },
  });
  return NextResponse.json(locations);
}

export async function POST(request: NextRequest) {
  try {
    const data = createLocationSchema.parse(await request.json());
    const location = await prisma.location.create({ data });
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
