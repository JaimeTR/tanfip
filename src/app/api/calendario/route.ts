// GET /api/calendario?token=...: feed iCal privado para suscribirse desde Google/Apple/Outlook Calendar.
import { timingSafeEqual } from "node:crypto";
import { getPublicDb } from "@/lib/db";
import { CLINIC_TZ } from "@/lib/db/dates";
import { calendarioIcs } from "@/lib/reminders";

export async function GET(req: Request) {
  const secret = process.env.CALENDAR_TOKEN;
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!secret || token.length !== secret.length || !timingSafeEqual(Buffer.from(token), Buffer.from(secret))) return new Response("No encontrado", { status: 404 });
  const db = getPublicDb();
  if (!db) return new Response("No disponible", { status: 503 });
  return new Response(await calendarioIcs(db, CLINIC_TZ), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=300" },
  });
}
