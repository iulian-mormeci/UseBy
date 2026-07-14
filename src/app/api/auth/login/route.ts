import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { handleApiError, jsonError } from "@/lib/api-utils";
import { loginSchema } from "@/lib/validation/auth";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = loginSchema.parse(await request.json());

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedHashBase64 = process.env.ADMIN_PASSWORD_HASH_BASE64;
    if (!expectedUsername || !expectedHashBase64) {
      return jsonError(
        "Autenticazione non configurata (ADMIN_USERNAME/ADMIN_PASSWORD_HASH_BASE64)",
        500,
      );
    }
    const expectedHash = Buffer.from(expectedHashBase64, "base64").toString("utf-8");

    const validUsername = username === expectedUsername;
    const validPassword = await bcrypt.compare(password, expectedHash);
    if (!validUsername || !validPassword) {
      return jsonError("Credenziali non valide", 401);
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
