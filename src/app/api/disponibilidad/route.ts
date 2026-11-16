// GET /api/disponibilidad?fecha=YYYY-MM-DD[&servicio=fisioterapia]
// Devuelve solo horas libres (nunca datos de pacientes). Sin `servicio`, devuelve las de todos los servicios activos.
import { getPublicDb } from "@/lib/db";
import { calcularHoras } from "@/lib/db/disponibilidad";
import { isISODate, todayISO } from "@/lib/db/dates";
import { limitar } from "@/lib/rate-limit";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!limitar(`disp:${ip}`, 60, 60_000)) return Response.json({ ok: false, error: "Demasiadas consultas" }, { status: 429, headers: NO_STORE });

  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get("fecha") ?? "";
  const servicio = searchParams.get("servicio") ?? "";
  if (!isISODate(fecha)) return Response.json({ ok: false, error: "fecha debe ser YYYY-MM-DD" }, { status: 400, headers: NO_STORE });

  // Reservas con al menos 1 día de anticipación: hoy y fechas pasadas no tienen horas.
  if (fecha <= todayISO()) return Response.json({ ok: true, fecha, horas: servicio ? [] : {} }, { headers: NO_STORE });

  const db = getPublicDb();
  if (!db) return Response.json({ ok: false, error: "Servicio no disponible" }, { status: 503, headers: NO_STORE });

  try {
    if (servicio) {
      if (!/^[a-z0-9_-]{2,40}$/.test(servicio)) return Response.json({ ok: false, error: "servicio inválido" }, { status: 400, headers: NO_STORE });
      return Response.json({ ok: true, fecha, servicio, horas: await calcularHoras(db, fecha, servicio) }, { headers: NO_STORE });
    }
    const activos = (await db.listServicios()).filter((s) => s.activo);
    const horas: Record<string, string[]> = {};
    for (const s of activos) horas[s.id] = await calcularHoras(db, fecha, s.id);
    return Response.json({ ok: true, fecha, horas }, { headers: NO_STORE });
  } catch {
    return Response.json({ ok: false, error: "Error al consultar la disponibilidad" }, { status: 500, headers: NO_STORE });
  }
}
