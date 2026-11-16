"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cambiarEstadoCita } from "@/app/admin/actions";
import type { Cita, Horario, Servicio } from "@/lib/db/types";
import { addDays, diaCorto, diaLargo, DIAS, diaSemana, lunesDe, mesAnio, sumaMin } from "@/lib/admin/format";
import { CitaModal, type CitaDefaults } from "./CitaModal";
import { IconChevronLeft, IconChevronRight, IconPlus } from "./icons";
import { Estado, useAct, Vacio } from "./ui";

type Vista = "semana" | "dia" | "lista";
const PX_HORA = 56;
const toMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));

export function CitasView({
  citas, pacientes, servicios, horarios, rol, hoy, abrirNueva,
}: {
  citas: Cita[]; pacientes: { id: string; nombre: string }[]; servicios: Servicio[]; horarios: Horario[]; rol: string; hoy: string; abrirNueva: boolean;
}) {
  const [vista, setVista] = useState<Vista>("semana");
  const [ancla, setAncla] = useState(hoy);
  const [fServ, setFServ] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [desde, setDesde] = useState(hoy);
  const [hasta, setHasta] = useState(addDays(hoy, 30));
  const [modal, setModal] = useState<{ abierto: boolean; cita: Cita | null; defaults?: CitaDefaults }>({ abierto: abrirNueva, cita: null });
  const { act } = useAct();

  useEffect(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setVista("dia");
  }, []);

  const nombre = (id: string) => pacientes.find((p) => p.id === id)?.nombre ?? "Paciente";
  const nombreServ = (id: string) => servicios.find((s) => s.id === id)?.nombre ?? id;

  const filtradas = useMemo(() => citas.filter((c) => (!fServ || c.servicio === fServ) && (!fEstado || c.estado === fEstado)), [citas, fServ, fEstado]);

  // rango de horas visible según el horario de atención
  const activos = horarios.filter((h) => h.activo);
  const hMin = Math.min(8, ...activos.map((h) => Math.floor(toMin(h.inicio) / 60)));
  const hMax = Math.max(18, ...activos.map((h) => Math.ceil(toMin(h.fin) / 60)));
  const horasEje = Array.from({ length: hMax - hMin }, (_, i) => hMin + i);

  const dias = vista === "semana" ? Array.from({ length: 7 }, (_, i) => addDays(lunesDe(ancla), i)) : [ancla];
  const paso = vista === "lista" ? 0 : vista === "semana" ? 7 : 1;
  const etiqueta = vista === "semana" ? `${diaCorto(dias[0])} – ${diaCorto(dias[6])}` : vista === "dia" ? diaLargo(ancla) : mesAnio(hoy);

  const abrirNuevaEn = (fecha: string, hora: string) => setModal({ abierto: true, cita: null, defaults: { fecha, hora } });

  const lista = useMemo(
    () => filtradas.filter((c) => c.fecha >= desde && c.fecha <= hasta).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)),
    [filtradas, desde, hasta],
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="a-h1">Citas</h1>
          <p className="a-muted text-sm capitalize">{etiqueta}</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ abierto: true, cita: null, defaults: { fecha: vista === "lista" ? hoy : ancla } })}>
          <IconPlus className="size-4" /> Nueva cita
        </button>
      </header>

      <div className="a-card a-card-pad flex flex-wrap items-center gap-3">
        <div className="a-tabs" role="tablist" aria-label="Vista">
          {([["semana", "Semana"], ["dia", "Día"], ["lista", "Lista"]] as const).map(([v, l]) => (
            <button key={v} role="tab" aria-selected={vista === v} className="a-tab" onClick={() => setVista(v)}>{l}</button>
          ))}
        </div>
        {paso > 0 && (
          <div className="flex items-center gap-1">
            <button type="button" className="btn-icon" onClick={() => setAncla(addDays(ancla, -paso))} aria-label="Anterior"><IconChevronLeft /></button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAncla(hoy)}>Hoy</button>
            <button type="button" className="btn-icon" onClick={() => setAncla(addDays(ancla, paso))} aria-label="Siguiente"><IconChevronRight /></button>
          </div>
        )}
        <select className="field field-sm w-auto" value={fServ} onChange={(e) => setFServ(e.target.value)} aria-label="Filtrar por servicio">
          <option value="">Todos los servicios</option>
          {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        {vista === "lista" && (
          <>
            <select className="field field-sm w-auto" value={fEstado} onChange={(e) => setFEstado(e.target.value)} aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option><option value="confirmada">Confirmada</option><option value="atendida">Atendida</option>
              <option value="cancelada">Cancelada</option><option value="no_asistio">No asistió</option>
            </select>
            <label className="flex items-center gap-2 text-sm">Desde <input type="date" className="field field-sm w-auto" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
            <label className="flex items-center gap-2 text-sm">Hasta <input type="date" className="field field-sm w-auto" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
          </>
        )}
      </div>

      {vista === "lista" ? (
        <div className="a-card overflow-hidden">
          {lista.length === 0 ? (
            <Vacio titulo="No hay citas en este rango" texto="Cambia las fechas o los filtros, o agenda una cita nueva." />
          ) : (
            <div className="overflow-x-auto">
              <table className="a-table">
                <thead>
                  <tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th className="hidden md:table-cell">Servicio</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr>
                </thead>
                <tbody>
                  {lista.map((c) => (
                    <tr key={c.id}>
                      <td className="whitespace-nowrap capitalize">{diaCorto(c.fecha)}</td>
                      <td className="whitespace-nowrap font-semibold">{c.hora}</td>
                      <td><Link className="font-semibold hover:text-teal" href={`/admin/pacientes/${c.pacienteId}`}>{nombre(c.pacienteId)}</Link></td>
                      <td className="hidden md:table-cell">{nombreServ(c.servicio)}</td>
                      <td>
                        <label className="sr-only" htmlFor={`est-${c.id}`}>Estado de la cita</label>
                        <select
                          id={`est-${c.id}`}
                          className={`st st-${c.estado} cursor-pointer appearance-none pr-3`}
                          value={c.estado}
                          onChange={(e) => act(() => cambiarEstadoCita(c.id, e.target.value), "Estado actualizado")}
                        >
                          <option value="pendiente">Pendiente</option><option value="confirmada">Confirmada</option><option value="atendida">Atendida</option>
                          <option value="cancelada">Cancelada</option><option value="no_asistio">No asistió</option>
                        </select>
                      </td>
                      <td className="text-right"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal({ abierto: true, cita: c })}>Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="a-card overflow-x-auto">
          <div className="ag-grid" style={{ ["--cols" as string]: dias.length }}>
            {/* cabecera */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur" />
            {dias.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setAncla(d); setVista("dia"); }}
                className={`sticky top-0 z-10 border-l border-teal/10 bg-white/80 px-2 py-2 text-center text-xs backdrop-blur ${d === hoy ? "font-bold text-teal" : "text-muted"}`}
                aria-label={`Ver ${diaLargo(d)}`}
              >
                <span className="block uppercase tracking-wide">{DIAS[diaSemana(d)].slice(0, 3)}</span>
                <span className={`mx-auto mt-0.5 grid size-8 place-items-center rounded-full font-display text-base ${d === hoy ? "bg-teal text-white" : "text-ink"}`}>{Number(d.slice(8))}</span>
              </button>
            ))}
            {/* eje de horas */}
            <div>
              {horasEje.map((h) => <div key={h} className="ag-hour">{String(h).padStart(2, "0")}:00</div>)}
            </div>
            {dias.map((d) => {
              const cerrado = !horarios.find((h) => h.dia === diaSemana(d))?.activo;
              return (
                <div key={d} className={`ag-col ${cerrado ? "bg-ink/[.03]" : ""}`} style={{ height: horasEje.length * PX_HORA }}>
                  {horasEje.map((h) => (
                    <button key={h} type="button" className="ag-slot" onClick={() => abrirNuevaEn(d, `${String(h).padStart(2, "0")}:00`)} aria-label={`Agendar el ${diaLargo(d)} a las ${h}:00`} />
                  ))}
                  {filtradas.filter((c) => c.fecha === d).map((c) => {
                    const top = ((toMin(c.hora) - hMin * 60) / 60) * PX_HORA;
                    const alto = Math.max((c.duracionMin / 60) * PX_HORA - 2, 22);
                    if (top < 0 || top > horasEje.length * PX_HORA) return null;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`ag-ev ag-ev-${c.estado}`}
                        style={{ top, height: alto }}
                        onClick={() => setModal({ abierto: true, cita: c })}
                        title={`${nombre(c.pacienteId)} · ${c.hora}–${sumaMin(c.hora, c.duracionMin)} · ${nombreServ(c.servicio)}`}
                      >
                        <strong className="block truncate">{c.hora} {nombre(c.pacienteId)}</strong>
                        <span className="block truncate opacity-80">{nombreServ(c.servicio)}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CitaModal
        open={modal.abierto}
        cita={modal.cita}
        defaults={modal.defaults}
        pacientes={pacientes}
        servicios={servicios}
        rol={rol}
        hoy={hoy}
        onClose={() => setModal((m) => ({ ...m, abierto: false }))}
      />
    </div>
  );
}
