"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/dispensa", label: "Dispensa" },
  { href: "/ricette", label: "Ricette" },
  { href: "/prodotti", label: "Prodotti" },
  { href: "/categorie", label: "Categorie" },
  { href: "/ubicazioni", label: "Ubicazioni" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-3">
        <span className="mr-4 font-semibold">UseBy</span>
        {LINKS.map((link) => {
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
      </div>
    </nav>
  );
}
