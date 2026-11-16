import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./config";

/** Cliente con la sesión del usuario (cookies): respeta RLS. */
export async function createUserClient() {
  const jar = await cookies();
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // llamado desde un Server Component: el proxy ya refresca la sesión
        }
      },
    },
  });
}

/** Cliente de servicio (ignora RLS). SOLO para endpoints públicos del servidor y acciones ya autorizadas. */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
