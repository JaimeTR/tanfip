"use client";
import Link from "next/link";
import { useState } from "react";
import { guardarAjustes } from "@/app/admin/actions";
import { CopyField } from "./CopyField";
import { Campo, useAct } from "./ui";

type Estado = { nombre: string; ok: boolean; detalle: string };

const EJEMPLO = { "{nombre}": "María", "{servicio}": "Fisioterapia", "{fecha}": "miércoles, 25 de noviembre", "{hora}": "10:00" };
const vista = (t: string) => Object.entries(EJEMPLO).reduce((s, [k, v]) => s.replaceAll(k, v), t);

export function ConfigView({ inicial, plantillaBase, calUrl, estado }: { inicial: { activo: boolean; plantilla: string }; plantillaBase: string; calUrl: string; estado: Estado[] }) {
  const [activo, setActivo] = useState(inicial.activo);
  const [plantilla, setPlantilla] = useState(inicial.plantilla || plantillaBase);
  const [error, setError] = useState("");
  const { act, busy } = useAct();

  const guardar = async () => {
    // Si el texto es igual al de fábrica se guarda vacío: así sigue el valor por defecto si algún día cambia.
    const r = await act(() => guardarAjustes({ recordatorioActivo: activo, recordatorioPlantilla: plantilla.trim() === plantillaBase.trim() ? "" : plantilla }), "Configuración guardada");
    setError(r.ok ? "" : r.error);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="a-h1">Configuración</h1>
        <p className="a-muted text-sm">Recordatorios, calendario y estado del sistema.</p>
      </header>

      <section className="a-card a-card-pad space-y-4" aria-labelledby="cfg-rec">
        <h2 id="cfg-rec" className="font-display text-lg font-semibold text-teal-deep">Recordatorios de citas</h2>
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 size-4" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
          <span>
            <span className="block font-semibold">Enviar correo automático un día antes</span>
            <span className="a-muted block text-sm">Se envía cada día a las 8:00 (hora de Lima) a los pacientes con cita mañana y correo registrado. El aviso por WhatsApp sigue disponible en Recordatorios.</span>
          </span>
        </label>
        <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="space-y-3">
          <Campo label="Texto del mensaje" hint="Variables: {nombre} {servicio} {fecha} {hora}. Se usa en el correo y en el WhatsApp." htmlFor="cfg-plantilla">
            <textarea id="cfg-plantilla" rows={6} maxLength={800} className="field" value={plantilla} onChange={(e) => setPlantilla(e.target.value)} />
          </Campo>
          <div className="rounded-xl bg-mint/60 p-3 text-sm">
            <p className="a-muted mb-1 text-xs font-semibold uppercase tracking-wide">Así lo verá el paciente</p>
            <p className="whitespace-pre-line">{vista(plantilla.trim() || plantillaBase)}</p>
          </div>
          <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{error}</p>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPlantilla(plantillaBase)}>Restaurar texto original</button>
          </div>
        </form>
      </section>

      <section className="a-card a-card-pad" aria-labelledby="cfg-cal">
        <h2 id="cfg-cal" className="font-display text-lg font-semibold text-teal-deep">Calendario</h2>
        {calUrl ? (
          <>
            <p className="a-muted mt-1 text-sm">En Google Calendar: Otros calendarios → Desde URL. En iPhone o Outlook, suscríbete al calendario con este enlace. Es privado: no lo compartas.</p>
            <CopyField value={calUrl} label="URL del calendario" />
          </>
        ) : (
          <p className="a-muted mt-1 text-sm">Activa el enlace definiendo <code>CALENDAR_TOKEN</code> y <code>NEXT_PUBLIC_SITE_URL</code> en el servidor.</p>
        )}
      </section>

      <section className="a-card a-card-pad" aria-labelledby="cfg-est">
        <h2 id="cfg-est" className="mb-2 font-display text-lg font-semibold text-teal-deep">Estado del sistema</h2>
        <ul className="divide-y divide-teal/10">
          {estado.map((e) => (
            <li key={e.nombre} className="flex items-start gap-3 py-2.5">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${e.ok ? "bg-leaf" : "bg-[#d9a300]"}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{e.nombre} <span className="sr-only">{e.ok ? "(activo)" : "(pendiente)"}</span></span>
                <span className="a-muted block text-sm">{e.detalle}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="a-card a-card-pad text-sm" aria-label="Otros ajustes">
        <p>Datos del negocio (WhatsApp, dirección, horarios, preguntas frecuentes): <Link href="/admin/sitio" className="font-semibold text-teal hover:underline">Sitio web</Link>.</p>
        <p className="mt-1">Tu contraseña y perfil: <Link href="/admin/perfil" className="font-semibold text-teal hover:underline">Mi perfil</Link>. Usuarios y roles: <Link href="/admin/usuarios" className="font-semibold text-teal hover:underline">Usuarios</Link>.</p>
      </section>
    </div>
  );
}
