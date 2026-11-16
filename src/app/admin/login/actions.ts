"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CLAVE_DEMO, USUARIOS_DEMO } from "@/lib/auth/session";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth/token";
import { limitar } from "@/lib/rate-limit";
import { demoAllowed, supabaseConfigured } from "@/lib/supabase/config";
import { createUserClient } from "@/lib/supabase/server";

export type LoginState = { error: string } | null;

const GENERICO = "Correo o contraseña incorrectos.";

export async function iniciarSesion(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const clave = String(form.get("password") ?? "").slice(0, 200);
  if (!email || !clave) return { error: "Escribe tu correo y contraseña." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!limitar(`login:${ip}:${email}`, 6, 10 * 60_000)) return { error: "Demasiados intentos. Espera unos minutos." };

  if (supabaseConfigured) {
    const sb = await createUserClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password: clave });
    if (error || !data.user) return { error: GENERICO };
    const { data: perfil } = await sb.from("profiles").select("rol, activo").eq("id", data.user.id).maybeSingle();
    if (!perfil || perfil.activo === false) {
      await sb.auth.signOut();
      return { error: "Tu usuario no tiene acceso al panel. Pídele acceso a la profesional." };
    }
  } else {
    if (!demoAllowed) return { error: "El acceso no está configurado todavía." };
    const u = USUARIOS_DEMO.find((x) => x.email === email);
    if (!u || clave !== CLAVE_DEMO) return { error: GENERICO };
    (await cookies()).set(SESSION_COOKIE, await signSession(u), {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE,
    });
  }
  redirect("/admin");
}

export async function cerrarSesion() {
  if (supabaseConfigured) await (await createUserClient()).auth.signOut();
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
