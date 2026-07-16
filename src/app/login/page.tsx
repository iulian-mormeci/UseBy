import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/forms/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, t] = await Promise.all([searchParams, getTranslations("Login")]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <LoginForm next={next && next.startsWith("/") ? next : "/admin"} />
    </div>
  );
}
