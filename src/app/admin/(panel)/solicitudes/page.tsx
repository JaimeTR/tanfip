import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { SolicitudesView } from "@/components/admin/SolicitudesView";

export const metadata = { title: "Solicitudes" };

export default async function SolicitudesPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const s = await requireSession();
  const { id } = await searchParams;
  const db = await getDb();
  const [solicitudes, servicios] = await Promise.all([db.listSolicitudes(), db.listServicios()]);
  // Recepción no ve el detalle clínico de la ficha.
  const lista =
    s.rol === "recepcion"
      ? solicitudes.map((x) => ({ ...x, patologia: "", antecedentes: "", medicamentos: "", zonas: [], desde: "" }))
      : solicitudes;
  return <SolicitudesView solicitudes={lista} servicios={servicios} rol={s.rol} abrirId={id} />;
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
