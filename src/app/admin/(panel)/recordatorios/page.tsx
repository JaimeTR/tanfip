import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { waLink, diaLargo } from "@/lib/admin/format";
import { recordatoriosDeManana } from "@/lib/reminders";
import { addDays, todayISO } from "@/lib/db/dates";

export const metadata = { title: "Recordatorios" };

export default async function RecordatoriosPage() {
  await requireSession();
  const lista = await recordatoriosDeManana(await getDb());
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-teal-deep">Recordatorios</h1>
        <p className="text-muted">Citas de mañana, {diaLargo(addDays(todayISO(), 1))}. El correo se envía solo cada día a las 8:00; aquí puedes avisar por WhatsApp.</p>
      </header>
      <section className="glass rounded-3xl p-4">
        {lista.length === 0 ? (
          <p className="p-4 text-muted">No hay citas para mañana.</p>
        ) : (
          <ul className="divide-y divide-teal/10">
            {lista.map((r) => (
              <li key={r.cita.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-semibold">{r.cita.hora} · {r.paciente.nombre}</span>
                  <span className="block text-sm text-muted">{r.servicio}{r.paciente.correo ? "" : " · sin correo"}</span>
                </span>
                {r.paciente.telefono ? (
                  <a className="btn btn-primary" href={waLink(r.paciente.telefono, r.texto)} target="_blank" rel="noopener">Avisar por WhatsApp</a>
                ) : (
                  <span className="text-sm text-muted">Sin teléfono</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export const instant = false;
