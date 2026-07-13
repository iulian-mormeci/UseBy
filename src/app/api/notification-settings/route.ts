import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { updateNotificationSettingSchema } from "@/lib/validation/notification-setting";

export async function GET() {
  const setting = await prisma.notificationSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return NextResponse.json(setting);
}

export async function PATCH(request: NextRequest) {
  try {
    const data = updateNotificationSettingSchema.parse(await request.json());
    const setting = await prisma.notificationSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    return NextResponse.json(setting);
  } catch (error) {
    return handleApiError(error);
  }
}
