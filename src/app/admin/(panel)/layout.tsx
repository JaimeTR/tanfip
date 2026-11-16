import { requireSession } from "@/lib/auth/session";
import { getDb, modoLocal } from "@/lib/db";
import { AdminShell } from "@/components/admin/Shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const db = await getDb();
  const [pacientes, solicitudes] = await Promise.all([db.listPacientes(), db.listSolicitudes()]);
  return (
    <AdminShell
      user={{ nombre: session.nombre, email: session.email, rol: session.rol }}
      modoLocal={modoLocal}
      nuevas={solicitudes.filter((s) => s.estado === "nueva").length}
      indice={{
        pacientes: pacientes.map((p) => ({ id: p.id, nombre: p.nombre, telefono: p.telefono })),
        solicitudes: solicitudes.slice(0, 80).map((s) => ({ id: s.id, nombre: s.nombre, estado: s.estado })),
      }}
    >
      {children}
    </AdminShell>
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
