"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const t = useTranslations("Login");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? t("invalidCredentials"));
      setSubmitting(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("usernameLabel")}</span>
        <input
          type="text"
          name="username"
          required
          autoFocus
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("passwordLabel")}</span>
        <input
          type="password"
          name="password"
          required
          className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
