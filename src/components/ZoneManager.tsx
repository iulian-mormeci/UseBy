"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DeleteButton } from "@/components/DeleteButton";

type Zone = { id: number; name: string };

export function ZoneManager({ locationId, zones }: { locationId: number; zones: Zone[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId, name }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Errore durante la creazione della zona");
      setSubmitting(false);
      return;
    }

    setName("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">Zone (es. ripiano alto, cassetto verdure)</span>

      {zones.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Nessuna zona definita.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {zones.map((zone) => (
            <li key={zone.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{zone.name}</span>
              <DeleteButton endpoint={`/api/zones/${zone.id}`} confirmMessage="Eliminare questa zona?" />
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">Nuova zona</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-gray-700"
        >
          Aggiungi
        </button>
      </form>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
