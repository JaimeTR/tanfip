import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { PLANTILLA_DEFAULT } from "@/lib/reminders";
import { ConfigView } from "@/components/admin/ConfigView";

export const metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  await requireSession(["profesional"]);
  const g = await (await getDb()).getSettings();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  return (
    <ConfigView
      inicial={{ activo: g.recordatorioActivo !== false, plantilla: g.recordatorioPlantilla ?? "" }}
      plantillaBase={PLANTILLA_DEFAULT}
      calUrl={process.env.CALENDAR_TOKEN ? `${base}/api/calendario?token=${process.env.CALENDAR_TOKEN}` : ""}
    />
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
