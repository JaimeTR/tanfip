import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { neonConfigured } from "@/lib/db/neon-config";
import { supabaseConfigured } from "@/lib/supabase/config";
import { UsuariosView } from "@/components/admin/UsuariosView";

export const metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  const s = await requireSession(["profesional"]);
  const disponible = neonConfigured && !supabaseConfigured;
  const usuarios = disponible ? await (await getDb()).listUsuarios() : [];
  return <UsuariosView usuarios={usuarios} disponible={disponible} yo={{ nombre: s.nombre, email: s.email }} />;
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
