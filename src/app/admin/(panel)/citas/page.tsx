import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/db/dates";
import { CitasView } from "@/components/admin/CitasView";

export const metadata = { title: "Citas" };

export default async function CitasPage({ searchParams }: { searchParams: Promise<{ nueva?: string; fecha?: string }> }) {
  const s = await requireSession();
  const sp = await searchParams;
  const db = await getDb();
  const [citas, pacientes, servicios, horarios] = await Promise.all([db.listCitas(), db.listPacientes(), db.listServicios(), db.listHorarios()]);
  return (
    <CitasView
      citas={citas}
      pacientes={pacientes.map((p) => ({ id: p.id, nombre: p.nombre }))}
      servicios={servicios}
      horarios={horarios}
      rol={s.rol}
      hoy={todayISO()}
      abrirNueva={sp.nueva === "1"}
    />
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
