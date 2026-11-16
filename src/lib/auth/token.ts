// Sesión local firmada (HMAC-SHA256) para el modo sin Supabase. Web Crypto: sirve en proxy y en servidor.
import type { Rol } from "@/lib/db/types";

export const SESSION_COOKIE = "tanfip_session";
export const SESSION_MAX_AGE = 60 * 60 * 8;

export type Session = { id: string; email: string; nombre: string; rol: Rol };

const secret = () => process.env.ADMIN_SESSION_SECRET || "tanfip-solo-desarrollo-local";
const enc = new TextEncoder();

const b64 = (buf: ArrayBuffer | Uint8Array) => {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

async function key() {
  return crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(s: Session): Promise<string> {
  const payload = b64(enc.encode(JSON.stringify({ ...s, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE })));
  const sig = b64(await crypto.subtle.sign("HMAC", await key(), enc.encode(payload)));
  return `${payload}.${sig}`;
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), unb64(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(unb64(payload)));
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    if (data.rol !== "profesional" && data.rol !== "recepcion") return null;
    return { id: String(data.id), email: String(data.email), nombre: String(data.nombre), rol: data.rol };
  } catch {
    return null;
  }
}
