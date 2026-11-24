import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/db/dates";
import { supabaseConfigured } from "@/lib/supabase/config";
import { PagosView } from "@/components/admin/PagosView";

export const metadata = { title: "Pagos" };

export default async function PagosPage() {
  const s = await requireSession();
  const db = await getDb();
  const [pagos, pacientes] = await Promise.all([db.listPagos(), db.listPacientes()]);
  return (
    <PagosView
      pagos={pagos}
      pacientes={pacientes.map((p) => ({ id: p.id, nombre: p.nombre }))}
      hoy={todayISO()}
      rol={s.rol}
      disponible={!supabaseConfigured}
    />
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
