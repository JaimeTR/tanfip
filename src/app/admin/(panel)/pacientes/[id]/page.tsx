import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/db/dates";
import { sinFicha } from "@/lib/admin/roles";
import { FichaView } from "@/components/admin/FichaView";

export const metadata = { title: "Ficha del paciente" };

export default async function FichaPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  const { id } = await params;
  const db = await getDb();
  const paciente = await db.getPaciente(id);
  if (!paciente) notFound();
  const profesional = s.rol === "profesional";
  const [citas, servicios, todos, notas, planes, archivos] = await Promise.all([
    db.listCitas(),
    db.listServicios(),
    db.listPacientes(),
    profesional ? db.listNotas(id) : Promise.resolve([]),
    profesional ? db.listPlanes(id) : Promise.resolve([]),
    profesional ? db.listArchivos(id) : Promise.resolve([]),
  ]);
  return (
    <FichaView
      paciente={profesional ? paciente : sinFicha(paciente)}
      citas={citas.filter((c) => c.pacienteId === id)}
      notas={notas}
      planes={planes}
      archivos={archivos}
      servicios={servicios}
      pacientes={todos.map((p) => ({ id: p.id, nombre: p.nombre }))}
      rol={s.rol}
      hoy={todayISO()}
    />
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
