import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { setLocaleSchema } from "@/lib/validation/locale";
import { LOCALE_COOKIE_NAME } from "@/i18n/request";

export async function POST(request: NextRequest) {
  try {
    const { locale } = setLocaleSchema.parse(await request.json());
    const response = NextResponse.json({ ok: true });
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
