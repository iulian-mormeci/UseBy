import { LoginForm } from "@/components/forms/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Accedi</h1>
      <LoginForm next={next && next.startsWith("/") ? next : "/admin"} />
    </div>
  );
}
