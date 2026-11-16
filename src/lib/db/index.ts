// Punto de entrada de la capa de datos. Elige Supabase o memoria según las variables de entorno.
import "server-only";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createServiceClient, createUserClient } from "@/lib/supabase/server";
import { memoryDb } from "./memory";
import { createNeonDb } from "./neon";
import { neonConfigured, neonUrl } from "./neon-config";
import { createSupabaseDb } from "./supabase";
import type { Db } from "./types";

export const modoLocal = !supabaseConfigured && !neonConfigured;

/** Db del usuario en sesión (respeta RLS). `elevated`: clave de servicio, solo para acciones ya autorizadas en el servidor. */
export async function getDb(opts?: { elevated?: boolean }): Promise<Db> {
  if (!supabaseConfigured) return neonConfigured ? createNeonDb(neonUrl!) : memoryDb;
  if (opts?.elevated) {
    const svc = createServiceClient();
    if (svc) return createSupabaseDb(svc);
  }
  return createSupabaseDb(await createUserClient());
}

/** Db para endpoints públicos (landing). Devuelve null si falta la clave de servicio. */
export function getPublicDb(): Db | null {
  if (!supabaseConfigured) return neonConfigured ? createNeonDb(neonUrl!) : memoryDb;
  const svc = createServiceClient();
  return svc ? createSupabaseDb(svc) : null;
}
