import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { neonConfigured } from "@/lib/db/neon-config";
import { demoAllowed, supabaseConfigured } from "@/lib/supabase/config";
import { createUserClient } from "@/lib/supabase/server";
import type { Rol } from "@/lib/db/types";
import { ValidationError } from "@/lib/db/validate";
import { SESSION_COOKIE, verifySession, type Session } from "./token";

export const USUARIOS_DEMO = [
  { id: "demo-tania", email: "tania@tanfip.demo", nombre: "Tania Castro", rol: "profesional" as Rol },
  { id: "demo-recepcion", email: "recepcion@tanfip.demo", nombre: "Recepción", rol: "recepcion" as Rol },
];
export const CLAVE_DEMO = "tanfip-demo";

/** Sesión actual (o null). Debe llamarse dentro de <Suspense> / tiempo de petición. */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!supabaseConfigured) {
    if (!neonConfigured && !demoAllowed) return null;
    return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  }
  const sb = await createUserClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  const { data: perfil } = await sb.from("profiles").select("nombre, rol, activo").eq("id", data.user.id).maybeSingle();
  if (!perfil || perfil.activo === false || (perfil.rol !== "profesional" && perfil.rol !== "recepcion")) return null;
  return { id: data.user.id, email: data.user.email ?? "", nombre: perfil.nombre || data.user.email || "", rol: perfil.rol };
});

/** Exige sesión (y rol, si se indica). Sin sesión → login; rol insuficiente → inicio. */
export async function requireSession(roles?: Rol[]): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (roles && !roles.includes(s.rol)) redirect("/admin");
  return s;
}

/** Para Server Actions: lanza en lugar de redirigir. */
export async function authorize(roles?: Rol[]): Promise<Session> {
  const s = await getSession();
  if (!s) throw new ValidationError("Tu sesión expiró. Vuelve a ingresar.");
  if (roles && !roles.includes(s.rol)) throw new ValidationError("No tienes permiso para esta acción.");
  return s;
}
