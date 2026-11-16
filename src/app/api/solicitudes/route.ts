// Recibe las solicitudes de cita y la ficha de registro desde la landing y las guarda en `solicitudes`.
// Contiene datos de salud: nunca se registra su contenido en logs.
import { getPublicDb } from "@/lib/db";
import { parseSolicitudPublica, ValidationError } from "@/lib/db/validate";
import { todayISO } from "@/lib/db/dates";
import { limitar } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!limitar(`sol:${ip}`, 8, 10 * 60_000)) {
    return Response.json({ ok: false, error: "Demasiados intentos. Intenta más tarde." }, { status: 429 });
  }
  if (Number(req.headers.get("content-length") ?? 0) > 60_000) {
    return Response.json({ ok: false, error: "Solicitud demasiado grande" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  // honeypot: un bot rellena este campo
  if (typeof body?.web === "string" && body.web.trim() !== "") {
    return Response.json({ ok: true });
  }

  let solicitud;
  try {
    solicitud = parseSolicitudPublica(body);
  } catch (e) {
    if (e instanceof ValidationError) return Response.json({ ok: false, error: "Faltan datos obligatorios" }, { status: 422 });
    throw e;
  }

  // Reservas con al menos 1 día de anticipación.
  if (solicitud.fecha && solicitud.fecha <= todayISO()) {
    return Response.json({ ok: false, error: "Reserva con al menos un día de anticipación" }, { status: 422 });
  }

  const db = getPublicDb();
  if (!db) return Response.json({ ok: false, error: "Servicio no disponible por ahora" }, { status: 503 });

  try {
    const servicios = await db.listServicios();
    if (!servicios.some((s) => s.id === solicitud.servicio && s.activo)) {
      return Response.json({ ok: false, error: "Servicio no disponible" }, { status: 422 });
    }
    // Sin cédula no se envía la columna, así el alta sigue funcionando aunque la migración 0004 no se haya aplicado.
    if (!solicitud.dni) delete (solicitud as { dni?: string }).dni;
    await db.createSolicitud(solicitud);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "No pudimos guardar tu solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
