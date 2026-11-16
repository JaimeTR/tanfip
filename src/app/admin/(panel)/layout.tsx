import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/admin/Shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const db = await getDb();
  const solicitudes = await db.listSolicitudes();
  return (
    <AdminShell
      user={{ nombre: session.nombre, email: session.email, rol: session.rol }}
      nuevas={solicitudes.filter((s) => s.estado === "nueva").length}
    >
      {children}
    </AdminShell>
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
