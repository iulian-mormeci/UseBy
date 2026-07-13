export type FieldErrors = Record<string, string[] | undefined>;

export type ApiErrorBody = {
  error: string;
  details?: { fieldErrors?: FieldErrors; formErrors?: string[] };
};

export async function submitJson(
  endpoint: string,
  method: "POST" | "PATCH",
  payload: unknown,
): Promise<{ ok: true; data: unknown } | { ok: false; message: string; fieldErrors: FieldErrors }> {
  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return { ok: true, data: await res.json() };
  }

  const body: ApiErrorBody = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
  return {
    ok: false,
    message: body.error ?? "Errore sconosciuto",
    fieldErrors: body.details?.fieldErrors ?? {},
  };
}
