import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { todayISO } from "@/lib/db/dates";
import { ServiciosView } from "@/components/admin/ServiciosView";

export const metadata = { title: "Servicios y horarios" };

export default async function ServiciosPage() {
  await requireSession();
  const db = await getDb();
  const [servicios, horarios, bloqueos] = await Promise.all([db.listServicios(), db.listHorarios(), db.listBloqueos()]);
  return <ServiciosView servicios={servicios} horarios={horarios} bloqueos={bloqueos.filter((b) => b.hasta >= todayISO())} />;
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
