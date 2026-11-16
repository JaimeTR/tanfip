import "server-only";
import { horasLibres } from "./availability";
import { nowParts } from "./dates";
import type { Db } from "./types";

/** Horas libres de un día para un servicio, leyendo horario, bloqueos, citas y solicitudes nuevas. */
export async function calcularHoras(db: Db, fecha: string, servicioId: string, excluirCitaId?: string): Promise<string[]> {
  const [servicios, horarios, bloqueos, citas, solicitudes] = await Promise.all([
    db.listServicios(), db.listHorarios(), db.listBloqueos(), db.listCitas(), db.listSolicitudes(),
  ]);
  const servicio = servicios.find((s) => s.id === servicioId);
  if (!servicio) return [];
  const { fecha: hoy, minutos } = nowParts();
  return horasLibres({ fecha, servicio, horarios, bloqueos, citas, solicitudes, servicios, hoy, ahoraMin: minutos, excluirCitaId });
}
