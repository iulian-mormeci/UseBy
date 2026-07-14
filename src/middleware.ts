import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

type Rule = { method?: string; path: RegExp };

// Routes that require the admin session. Deliberately narrow: day-to-day
// pantry use (dashboard, dispensa, barcode scanning, recipe browsing,
// reporting a missing product) stays open for the whole household — only
// catalog/recipe/location curation and the admin-only views are gated.
const ADMIN_RULES: Rule[] = [
  { path: /^\/admin(\/|$)/ },
  { path: /^\/prodotti\/[^/]+\/modifica$/ },
  { path: /^\/categorie\/nuovo$/ },
  { path: /^\/categorie\/[^/]+\/modifica$/ },
  { path: /^\/ubicazioni\/nuovo$/ },
  { path: /^\/ubicazioni\/[^/]+\/modifica$/ },
  { path: /^\/ricette\/nuovo$/ },
  { path: /^\/ricette\/[^/]+\/modifica$/ },
  { path: /^\/segnalazioni$/ },

  { method: "PATCH", path: /^\/api\/products\/[^/]+$/ },
  { method: "DELETE", path: /^\/api\/products\/[^/]+$/ },
  { method: "POST", path: /^\/api\/categories$/ },
  { method: "PATCH", path: /^\/api\/categories\/[^/]+$/ },
  { method: "DELETE", path: /^\/api\/categories\/[^/]+$/ },
  { method: "POST", path: /^\/api\/locations$/ },
  { method: "PATCH", path: /^\/api\/locations\/[^/]+$/ },
  { method: "DELETE", path: /^\/api\/locations\/[^/]+$/ },
  { method: "POST", path: /^\/api\/zones$/ },
  { method: "DELETE", path: /^\/api\/zones\/[^/]+$/ },
  { method: "POST", path: /^\/api\/recipes$/ },
  { method: "PATCH", path: /^\/api\/recipes\/[^/]+$/ },
  { method: "DELETE", path: /^\/api\/recipes\/[^/]+$/ },
  { method: "GET", path: /^\/api\/missing-product-reports$/ },
  { method: "GET", path: /^\/api\/missing-product-reports\/[^/]+$/ },
  { method: "PATCH", path: /^\/api\/missing-product-reports\/[^/]+$/ },
  { method: "DELETE", path: /^\/api\/missing-product-reports\/[^/]+$/ },
  { method: "GET", path: /^\/api\/pending-product-submissions$/ },
  { method: "GET", path: /^\/api\/pending-product-submissions\/[^/]+$/ },
  { method: "PATCH", path: /^\/api\/pending-product-submissions\/[^/]+$/ },
  { method: "DELETE", path: /^\/api\/pending-product-submissions\/[^/]+$/ },
  { method: "PATCH", path: /^\/api\/notification-settings$/ },
];

function matchesRule(method: string, path: string): boolean {
  return ADMIN_RULES.some((rule) => (!rule.method || rule.method === method) && rule.path.test(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!matchesRule(request.method, pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);

  if (authenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/).*)"],
};
