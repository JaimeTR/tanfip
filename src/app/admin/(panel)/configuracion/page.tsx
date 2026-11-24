import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { neonConfigured } from "@/lib/db/neon-config";
import { supabaseConfigured } from "@/lib/supabase/config";
import { PLANTILLA_DEFAULT } from "@/lib/reminders";
import { ConfigView } from "@/components/admin/ConfigView";

export const metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  await requireSession(["profesional"]);
  const g = await (await getDb()).getSettings();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  // Solo se envían booleanos al navegador: nunca los valores de las claves.
  const estado = [
    { nombre: "Base de datos", ok: neonConfigured || supabaseConfigured, detalle: supabaseConfigured ? "Supabase" : neonConfigured ? "Neon" : "Modo local (datos de ejemplo, se pierden al reiniciar)" },
    { nombre: "Correo (Resend)", ok: !!process.env.RESEND_API_KEY, detalle: process.env.RESEND_API_KEY ? "Listo para enviar" : "Falta RESEND_API_KEY: solo se avisa por WhatsApp" },
    { nombre: "Recordatorio diario", ok: !!process.env.CRON_SECRET, detalle: process.env.CRON_SECRET ? "Programado a las 8:00 (hora de Lima)" : "Falta CRON_SECRET" },
    { nombre: "Calendario (.ics)", ok: !!process.env.CALENDAR_TOKEN, detalle: process.env.CALENDAR_TOKEN ? "Enlace activo" : "Falta CALENDAR_TOKEN" },
    { nombre: "Sesión segura", ok: !!process.env.ADMIN_SESSION_SECRET, detalle: process.env.ADMIN_SESSION_SECRET ? "Secreto configurado" : "Falta ADMIN_SESSION_SECRET" },
  ];
  return (
    <ConfigView
      inicial={{ activo: g.recordatorioActivo !== false, plantilla: g.recordatorioPlantilla ?? "" }}
      plantillaBase={PLANTILLA_DEFAULT}
      calUrl={process.env.CALENDAR_TOKEN ? `${base}/api/calendario?token=${process.env.CALENDAR_TOKEN}` : ""}
      estado={estado}
    />
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
