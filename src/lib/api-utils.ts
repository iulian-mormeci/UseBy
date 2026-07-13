import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    { error: message, ...(details !== undefined ? { details } : {}) },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Dati non validi", 400, error.flatten());
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return jsonError("Esiste già un record con questo valore univoco", 409, error.meta);
    }
    if (error.code === "P2025") {
      return jsonError("Risorsa non trovata", 404);
    }
    if (error.code === "P2003") {
      return jsonError("Riferimento non valido", 400, error.meta);
    }
  }

  console.error(error);
  return jsonError("Errore interno del server", 500);
}
