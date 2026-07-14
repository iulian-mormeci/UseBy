import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pendingCount = await prisma.pendingProductSubmission.count({
    where: { status: { in: ["PENDING", "EMAILED"] } },
  });

  const links = [
    { href: "/prodotti", label: "Prodotti", hint: "Modifica ed elimina voci di catalogo" },
    { href: "/categorie", label: "Categorie", hint: "Aggiungi, modifica, elimina" },
    { href: "/ubicazioni", label: "Ubicazioni e zone", hint: "Aggiungi, modifica, elimina" },
    { href: "/ricette", label: "Ricette", hint: "Aggiungi, modifica, elimina" },
    { href: "/segnalazioni", label: "Segnalazioni prodotti mancanti", hint: "Gestisci lo stato" },
    {
      href: "/admin/segnalazioni-prodotti",
      label: "Prodotti da revisionare",
      hint: `${pendingCount} in attesa`,
    },
    { href: "/admin/impostazioni", label: "Impostazioni", hint: "Preavviso scadenza di default" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pannello Admin</h1>
        <LogoutButton className="text-sm font-medium text-gray-500 hover:underline dark:text-gray-400" />
      </div>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center justify-between gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <span className="font-medium">{link.label}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{link.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
