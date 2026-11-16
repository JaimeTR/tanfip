"use client";
import { useState } from "react";
import { agregarBloqueo, eliminarBloqueo, guardarHorarios, guardarServicio } from "@/app/admin/actions";
import type { Bloqueo, Horario, Servicio } from "@/lib/db/types";
import { diaNum, DIAS } from "@/lib/admin/format";
import { IconPlus, IconTrash } from "./icons";
import { Campo, Modal, useAct, useUi, Vacio } from "./ui";

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
const ORDEN = [1, 2, 3, 4, 5, 6, 0]; // lunes primero

export function ServiciosView({ servicios, horarios, bloqueos }: { servicios: Servicio[]; horarios: Horario[]; bloqueos: Bloqueo[] }) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="a-h1">Servicios y horarios</h1>
        <p className="a-muted text-sm">Lo que ofreces y cuándo atiendes. La web usa estos horarios para mostrar horas libres.</p>
      </header>
      <ServiciosSeccion servicios={servicios} />
      <HorariosSeccion horarios={horarios} />
      <BloqueosSeccion bloqueos={bloqueos} />
    </div>
  );
}

function ServiciosSeccion({ servicios }: { servicios: Servicio[] }) {
  const [nuevo, setNuevo] = useState(false);
  return (
    <section aria-labelledby="serv-h" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="serv-h" className="font-display text-xl font-semibold text-teal-deep">Servicios</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNuevo(true)}><IconPlus className="size-4" /> Nuevo servicio</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {servicios.map((s) => <ServicioCard key={s.id + s.nombre + s.duracionMin + s.activo + s.descripcion} s={s} />)}
      </div>
      <NuevoServicio open={nuevo} onClose={() => setNuevo(false)} />
    </section>
  );
}

function ServicioCard({ s }: { s: Servicio }) {
  const [d, setD] = useState(s);
  const { act, busy } = useAct();
  const cambiado = JSON.stringify(d) !== JSON.stringify(s);
  return (
    <form className="a-card a-card-pad space-y-3" onSubmit={(e) => { e.preventDefault(); act(() => guardarServicio(d), "Servicio guardado"); }}>
      <div className="flex items-center justify-between gap-3">
        <Estado activo={d.activo} />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="size-4 accent-[#1b7f8e]" checked={d.activo} onChange={(e) => setD({ ...d, activo: e.target.checked })} />
          Disponible para reservar
        </label>
      </div>
      <Campo label="Nombre" htmlFor={`sn-${s.id}`}><input id={`sn-${s.id}`} className="field field-sm" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} maxLength={80} /></Campo>
      <Campo label="Descripción" htmlFor={`sd-${s.id}`}><textarea id={`sd-${s.id}`} className="field" rows={2} value={d.descripcion} onChange={(e) => setD({ ...d, descripcion: e.target.value })} maxLength={300} /></Campo>
      <Campo label="Duración de cada sesión (minutos)" htmlFor={`sm-${s.id}`}><input id={`sm-${s.id}`} type="number" min={10} max={480} step={5} className="field field-sm w-32" value={d.duracionMin} onChange={(e) => setD({ ...d, duracionMin: Number(e.target.value) })} /></Campo>
      <button type="submit" className="btn btn-primary btn-sm" disabled={!cambiado || busy}>{busy ? "Guardando…" : "Guardar cambios"}</button>
    </form>
  );
}
const Estado = ({ activo }: { activo: boolean }) => <span className={`st ${activo ? "st-activo" : "st-inactivo"}`}>{activo ? "Activo" : "Oculto"}</span>;

function NuevoServicio({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [nombre, setNombre] = useState("");
  const [dur, setDur] = useState(60);
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const guardar = async () => {
    const id = slug(nombre);
    if (id.length < 2) return setError("Escribe un nombre.");
    const r = await act(() => guardarServicio({ id, nombre, descripcion: "", duracionMin: dur, activo: true }), "Servicio creado");
    if (r.ok) { setNombre(""); setError(""); onClose(); } else setError(r.error);
  };
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Nuevo servicio" footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button><button className="btn btn-primary btn-sm" onClick={guardar} disabled={busy}>Crear</button></>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); guardar(); }}>
        <Campo label="Nombre" htmlFor="ns-n"><input id="ns-n" className="field field-sm" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} placeholder="Ej. Masaje descontracturante" /></Campo>
        <Campo label="Duración (min)" htmlFor="ns-d"><input id="ns-d" type="number" min={10} max={480} step={5} className="field field-sm w-32" value={dur} onChange={(e) => setDur(Number(e.target.value))} /></Campo>
        <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{error}</p>
        <button type="submit" className="sr-only">Crear</button>
      </form>
    </Modal>
  );
}

function HorariosSeccion({ horarios }: { horarios: Horario[] }) {
  const [h, setH] = useState(() => ORDEN.map((dia) => horarios.find((x) => x.dia === dia) ?? { dia, activo: false, inicio: "08:00", fin: "18:00", pausaInicio: "", pausaFin: "" }));
  const { act, busy } = useAct();
  const upd = (dia: number, patch: Partial<Horario>) => setH((l) => l.map((x) => (x.dia === dia ? { ...x, ...patch } : x)));
  return (
    <section aria-labelledby="hor-h" className="space-y-4">
      <h2 id="hor-h" className="font-display text-xl font-semibold text-teal-deep">Horario de atención</h2>
      <form className="a-card overflow-hidden" onSubmit={(e) => { e.preventDefault(); act(() => guardarHorarios([...h].sort((a, b) => a.dia - b.dia)), "Horario guardado"); }}>
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead><tr><th>Día</th><th>Atiende</th><th>Desde</th><th>Hasta</th><th>Pausa desde</th><th>Pausa hasta</th></tr></thead>
            <tbody>
              {h.map((x) => (
                <tr key={x.dia} className={x.activo ? "" : "opacity-60"}>
                  <td className="font-semibold">{DIAS[x.dia]}</td>
                  <td><input type="checkbox" className="size-5 accent-[#1b7f8e]" checked={x.activo} onChange={(e) => upd(x.dia, { activo: e.target.checked })} aria-label={`${DIAS[x.dia]}: atiende`} /></td>
                  <td><input type="time" className="field field-sm w-32" value={x.inicio} disabled={!x.activo} onChange={(e) => upd(x.dia, { inicio: e.target.value })} aria-label={`${DIAS[x.dia]}: desde`} /></td>
                  <td><input type="time" className="field field-sm w-32" value={x.fin} disabled={!x.activo} onChange={(e) => upd(x.dia, { fin: e.target.value })} aria-label={`${DIAS[x.dia]}: hasta`} /></td>
                  <td><input type="time" className="field field-sm w-32" value={x.pausaInicio} disabled={!x.activo} onChange={(e) => upd(x.dia, { pausaInicio: e.target.value })} aria-label={`${DIAS[x.dia]}: pausa desde`} /></td>
                  <td><input type="time" className="field field-sm w-32" value={x.pausaFin} disabled={!x.activo} onChange={(e) => upd(x.dia, { pausaFin: e.target.value })} aria-label={`${DIAS[x.dia]}: pausa hasta`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-teal/10 px-4 py-3">
          <p className="text-xs text-muted">Deja la pausa vacía si no hay almuerzo.</p>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? "Guardando…" : "Guardar horario"}</button>
        </div>
      </form>
    </section>
  );
}

function BloqueosSeccion({ bloqueos }: { bloqueos: Bloqueo[] }) {
  const [d, setD] = useState({ desde: "", hasta: "", motivo: "" });
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();
  const agregar = async () => {
    if (!d.desde) return setError("Elige la fecha de inicio.");
    const r = await act(() => agregarBloqueo({ ...d, hasta: d.hasta || d.desde }), "Bloqueo agregado");
    if (r.ok) { setD({ desde: "", hasta: "", motivo: "" }); setError(""); } else setError(r.error);
  };
  return (
    <section aria-labelledby="blq-h" className="space-y-4">
      <h2 id="blq-h" className="font-display text-xl font-semibold text-teal-deep">Vacaciones y feriados</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <form className="a-card a-card-pad space-y-3" onSubmit={(e) => { e.preventDefault(); agregar(); }}>
          <p className="a-muted text-sm">Los días bloqueados no ofrecen horas en la web ni en el agendador.</p>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Desde" htmlFor="b-d"><input id="b-d" type="date" className="field field-sm" value={d.desde} onChange={(e) => setD({ ...d, desde: e.target.value })} /></Campo>
            <Campo label="Hasta" htmlFor="b-h" hint="Vacío = un solo día"><input id="b-h" type="date" className="field field-sm" value={d.hasta} min={d.desde} onChange={(e) => setD({ ...d, hasta: e.target.value })} /></Campo>
          </div>
          <Campo label="Motivo" htmlFor="b-m"><input id="b-m" className="field field-sm" value={d.motivo} maxLength={120} onChange={(e) => setD({ ...d, motivo: e.target.value })} placeholder="Ej. Feriado, vacaciones" /></Campo>
          <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{error}</p>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}><IconPlus className="size-4" /> Bloquear fechas</button>
        </form>
        <div className="a-card">
          {bloqueos.length === 0 ? (
            <Vacio titulo="Sin bloqueos próximos" texto="Agrega vacaciones, feriados o días de capacitación." />
          ) : (
            <ul className="divide-y divide-teal/10">
              {bloqueos.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span>
                    <span className="block font-semibold">{b.motivo || "Bloqueo"}</span>
                    <span className="block text-sm text-muted">{b.desde === b.hasta ? diaNum(b.desde) : `${diaNum(b.desde)} → ${diaNum(b.hasta)}`}</span>
                  </span>
                  <button
                    type="button" className="btn-icon" aria-label={`Quitar bloqueo ${b.motivo}`}
                    onClick={async () => {
                      if (await confirm({ title: "¿Quitar este bloqueo?", message: "Esos días volverán a ofrecer horas.", confirmLabel: "Quitar", danger: true })) act(() => eliminarBloqueo(b.id), "Bloqueo eliminado");
                    }}
                  >
                    <IconTrash />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
