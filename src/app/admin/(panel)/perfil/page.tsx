import { requireSession } from "@/lib/auth/session";
import { supabaseConfigured } from "@/lib/supabase/config";
import { PerfilView } from "@/components/admin/PerfilView";

export const metadata = { title: "Mi perfil" };

export default async function PerfilPage() {
  const s = await requireSession();
  return <PerfilView user={{ nombre: s.nombre, email: s.email, rol: s.rol }} puedeCambiarClave={supabaseConfigured || s.id !== "admin"} />;
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
