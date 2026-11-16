// Barrera rápida para /admin/**: sin sesión → /admin/login. La verificación real se repite en cada página y acción.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esLogin = pathname === "/admin/login";
  let response = NextResponse.next({ request });
  let autenticado = false;

  if (supabaseConfigured) {
    // Refresca la sesión de Supabase (cookies) y comprueba que sea válida.
    const sb = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    const { data } = await sb.auth.getUser();
    autenticado = Boolean(data.user);
  } else {
    autenticado = Boolean(await verifySession(request.cookies.get(SESSION_COOKIE)?.value));
  }

  if (!autenticado && !esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (autenticado && esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
