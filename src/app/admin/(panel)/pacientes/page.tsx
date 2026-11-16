import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/db/dates";
import { sinFicha } from "@/lib/admin/roles";
import { PacientesView } from "@/components/admin/PacientesView";

export const metadata = { title: "Pacientes" };

export default async function PacientesPage({ searchParams }: { searchParams: Promise<{ nuevo?: string }> }) {
  const s = await requireSession();
  const { nuevo } = await searchParams;
  const db = await getDb();
  const [pacientes, servicios, citas] = await Promise.all([db.listPacientes(), db.listServicios(), db.listCitas()]);
  const hoy = todayISO();
  // próxima cita (activa) por paciente
  const proxima: Record<string, string> = {};
  for (const c of citas) {
    if (c.fecha >= hoy && (c.estado === "pendiente" || c.estado === "confirmada")) {
      const k = c.fecha + " " + c.hora;
      if (!proxima[c.pacienteId] || k < proxima[c.pacienteId]) proxima[c.pacienteId] = k;
    }
  }
  const lista = s.rol === "recepcion" ? pacientes.map(sinFicha) : pacientes;
  return <PacientesView pacientes={lista} servicios={servicios} proxima={proxima} rol={s.rol} abrirNuevo={nuevo === "1"} />;
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
