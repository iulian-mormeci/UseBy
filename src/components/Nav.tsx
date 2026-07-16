"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogoutButton } from "@/components/LogoutButton";

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  const LINKS = [
    { href: "/", label: t("dashboard") },
    { href: "/dispensa", label: t("dispensa") },
    { href: "/ricette", label: t("ricette") },
    { href: "/prodotti", label: t("prodotti") },
    { href: "/categorie", label: t("categorie") },
    { href: "/ubicazioni", label: t("ubicazioni") },
  ];

  const links = isAdmin
    ? [...LINKS, { href: "/segnalazioni", label: t("segnalazioni") }, { href: "/admin", label: t("admin") }]
    : LINKS;

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-3">
        <span className="mr-4 font-semibold">UseBy</span>
        {links.map((link) => {
          const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
        <div className="ml-auto">
          {isAdmin ? (
            <LogoutButton className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" />
          ) : (
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t("login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
