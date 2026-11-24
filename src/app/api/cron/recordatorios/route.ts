// GET /api/cron/recordatorios: lo llama Vercel Cron una vez al día. Envía por correo el aviso de las citas de mañana.
import { timingSafeEqual } from "node:crypto";
import { getPublicDb } from "@/lib/db";
import { enviarCorreo } from "@/lib/email";
import { recordatoriosDeManana } from "@/lib/reminders";

const igual = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ ok: false, error: "CRON_SECRET no configurado" }, { status: 503 });
  if (!igual(req.headers.get("authorization") ?? "", `Bearer ${secret}`)) return Response.json({ ok: false }, { status: 401 });
  const db = getPublicDb();
  if (!db) return Response.json({ ok: false, error: "Servicio no disponible" }, { status: 503 });

  if ((await db.getSettings()).recordatorioActivo === false) return Response.json({ ok: true, omitido: "desactivado en Configuración" });
  const lista = await recordatoriosDeManana(db);
  const res = { enviados: 0, sinCorreo: 0, errores: 0 };
  for (const r of lista) {
    const e = await enviarCorreo(r.paciente.correo, "Recordatorio de tu cita · TANFIP", r.texto);
    if (e === "enviado") res.enviados++;
    else if (e === "error") res.errores++;
    else res.sinCorreo++;
  }
  return Response.json({ ok: true, total: lista.length, ...res });
}
