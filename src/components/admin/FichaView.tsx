"use client";
import Link from "next/link";
import { useState } from "react";
import { guardarNota } from "@/app/admin/actions";
import type { Archivo, Cita, Nota, Paciente, Plan, Servicio } from "@/lib/db/types";
import { colorEva, diaNum, fechaHora, formatoTelefono, iniciales, soloFecha, waLink } from "@/lib/admin/format";
import { IconCalendar } from "@/components/Icons";
import { ArchivosTab } from "./ArchivosTab";
import { BodyMap } from "./BodyMap";
import { CitaModal } from "./CitaModal";
import { PlanModal, NotaModal } from "./FichaModals";
import { IconEdit, IconNote, IconPin, IconPlus, IconTarget, IconWhatsapp } from "./icons";
import { PacienteModal } from "./PacienteModal";
import { Estado, useAct, Vacio } from "./ui";

type Tab = "resumen" | "evolucion" | "citas" | "plan" | "archivos";

export function FichaView({
  paciente, citas, notas, planes, archivos, servicios, pacientes, rol, hoy,
}: {
  paciente: Paciente; citas: Cita[]; notas: Nota[]; planes: Plan[]; archivos: Archivo[]; servicios: Servicio[]; pacientes: { id: string; nombre: string }[]; rol: string; hoy: string;
}) {
  const prof = rol === "profesional";
  const [tab, setTab] = useState<Tab>("resumen");
  const [editar, setEditar] = useState(false);
  const [nota, setNota] = useState<{ abierto: boolean; nota: Nota | null }>({ abierto: false, nota: null });
  const [plan, setPlan] = useState<{ abierto: boolean; plan: Plan | null }>({ abierto: false, plan: null });
  const [cita, setCita] = useState<{ abierto: boolean; cita: Cita | null }>({ abierto: false, cita: null });
  const nombreServ = (id: string) => servicios.find((s) => s.id === id)?.nombre ?? id;

  const tabs: { id: Tab; label: string }[] = [
    { id: "resumen", label: "Resumen" },
    ...(prof ? [{ id: "evolucion" as Tab, label: `Evolución (${notas.length})` }] : []),
    { id: "citas", label: `Citas (${citas.length})` },
    ...(prof ? [{ id: "plan" as Tab, label: "Plan de tratamiento" }, { id: "archivos" as Tab, label: `Archivos (${archivos.length})` }] : []),
  ];

  return (
    <div className="space-y-5">
      <nav aria-label="Ruta" className="text-sm"><Link href="/admin/pacientes" className="text-teal hover:underline">← Pacientes</Link></nav>

      <header className="a-card a-card-pad flex flex-wrap items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-deep font-display text-xl font-semibold text-white" aria-hidden="true">{iniciales(paciente.nombre)}</span>
        <div className="min-w-0 flex-1">
          <h1 className="a-h1">{paciente.nombre}</h1>
          <p className="a-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <Estado valor={paciente.estado} />
            {paciente.edad != null && <span>{paciente.edad} años</span>}
            <span>{nombreServ(paciente.servicio)}</span>
            {paciente.telefono && <span>{formatoTelefono(paciente.telefono)}</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {paciente.telefono && (
            <a className="btn btn-ghost btn-sm" href={waLink(paciente.telefono, `Hola ${paciente.nombre.split(" ")[0]}, `)} target="_blank" rel="noopener noreferrer"><IconWhatsapp className="size-4" /> WhatsApp</a>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditar(true)}><IconEdit className="size-4" /> Editar</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCita({ abierto: true, cita: null })}><IconCalendar className="size-4" /> Nueva cita</button>
          {prof && <button type="button" className="btn btn-primary btn-sm" onClick={() => { setTab("evolucion"); setNota({ abierto: true, nota: null }); }}><IconNote className="size-4" /> Nueva nota</button>}
        </div>
      </header>

      <div className="a-tabs" role="tablist" aria-label="Secciones de la ficha">
        {tabs.map((t) => <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="panel-ficha" className="a-tab" onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div id="panel-ficha" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "resumen" && <Resumen paciente={paciente} notas={notas} prof={prof} nombreServ={nombreServ} onNota={(n) => { setTab("evolucion"); setNota({ abierto: true, nota: n }); }} />}
        {tab === "evolucion" && prof && (
          <Evolucion notas={notas} onNueva={() => setNota({ abierto: true, nota: null })} onEditar={(n) => setNota({ abierto: true, nota: n })} />
        )}
        {tab === "citas" && <Citas citas={citas} nombreServ={nombreServ} onNueva={() => setCita({ abierto: true, cita: null })} onEditar={(c) => setCita({ abierto: true, cita: c })} />}
        {tab === "plan" && prof && <Planes planes={planes} onNuevo={() => setPlan({ abierto: true, plan: null })} onEditar={(p) => setPlan({ abierto: true, plan: p })} />}
        {tab === "archivos" && prof && <ArchivosTab pacienteId={paciente.id} archivos={archivos} />}
      </div>

      <PacienteModal open={editar} onClose={() => setEditar(false)} paciente={paciente} servicios={servicios} rol={rol} />
      {prof && <NotaModal open={nota.abierto} nota={nota.nota} pacienteId={paciente.id} hoy={hoy} onClose={() => setNota((n) => ({ ...n, abierto: false }))} />}
      {prof && <PlanModal open={plan.abierto} plan={plan.plan} pacienteId={paciente.id} hoy={hoy} onClose={() => setPlan((n) => ({ ...n, abierto: false }))} />}
      <CitaModal open={cita.abierto} cita={cita.cita} defaults={{ pacienteId: paciente.id }} pacientes={pacientes} servicios={servicios} rol={rol} hoy={hoy} onClose={() => setCita((c) => ({ ...c, abierto: false }))} />
    </div>
  );
}

function Dato({ k, v }: { k: string; v?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm [overflow-wrap:anywhere]">{v || <span className="text-muted">—</span>}</dd>
    </div>
  );
}

function Resumen({ paciente: p, notas, prof, nombreServ, onNota }: { paciente: Paciente; notas: Nota[]; prof: boolean; nombreServ: (id: string) => string; onNota: (n: Nota) => void }) {
  const fijadas = notas.filter((n) => n.fijada);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
      {prof && fijadas.length > 0 && (
        <section className="lg:col-span-2 rounded-2xl border border-[#f2dc9b] bg-[#fff9e6] p-4" aria-label="Notas fijadas">
          <h2 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-[#6d4c00]"><IconPin className="size-5" /> Notas fijadas</h2>
          <ul className="space-y-2">
            {fijadas.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => onNota(n)} className="w-full rounded-xl bg-white/80 p-3 text-left text-sm hover:bg-white">
                  <span className="text-xs text-muted">{diaNum(n.fecha)}</span>
                  <span className="block whitespace-pre-line">{n.observaciones || n.proximaIndicacion || n.subjetivo}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="a-card a-card-pad">
        <h2 className="mb-4 font-display text-lg font-semibold text-teal-deep">Datos personales</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Dato k="Teléfono" v={p.telefono ? formatoTelefono(p.telefono) : ""} />
          <Dato k="Correo" v={p.correo} />
          <Dato k="Residencia" v={p.direccion} />
          <Dato k="Servicio principal" v={nombreServ(p.servicio)} />
          <Dato k="Registro" v={soloFecha(p.creadoEn)} />
          <Dato k="Consentimiento" v={p.consentimiento ? `Firmado el ${soloFecha(p.consentimientoAt)}` : <span className="st st-pendiente">Pendiente</span>} />
        </dl>
      </section>
      {prof ? (
        <section className="a-card a-card-pad">
          <h2 className="mb-4 font-display text-lg font-semibold text-teal-deep">Historia clínica</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato k="Motivo de consulta" v={p.motivoConsulta} />
            <Dato k="Desde cuándo" v={p.desde} />
            <div className="sm:col-span-2"><Dato k="Patología / diagnóstico" v={p.patologia} /></div>
            <div className="sm:col-span-2"><Dato k="Antecedentes" v={p.antecedentes} /></div>
            <div className="sm:col-span-2"><Dato k="Medicamentos" v={p.medicamentos} /></div>
          </dl>
        </section>
      ) : (
        <section className="a-card a-card-pad"><p className="a-muted text-sm">La historia clínica solo está disponible para la profesional.</p></section>
      )}
      {prof && (
        <section className="a-card a-card-pad lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-teal-deep">Zonas de dolor</h2>
          <BodyMap value={p.zonas} />
        </section>
      )}
      {prof && notas.length > 1 && (
        <section className="a-card a-card-pad lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-teal-deep">Evolución del dolor</h2>
          <PainChart notas={notas} />
        </section>
      )}
    </div>
  );
}

function PainChart({ notas }: { notas: Nota[] }) {
  const orden = [...notas].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const W = 560, H = 190, L = 28, R = 12, T = 14, B = 30;
  const x = (i: number) => (orden.length === 1 ? (W + L) / 2 : L + (i * (W - L - R)) / (orden.length - 1));
  const y = (v: number) => T + ((10 - v) * (H - T - B)) / 10;
  const puntos = orden.map((n, i) => `${x(i)},${y(n.eva)}`).join(" ");
  const primero = orden[0].eva, ultimo = orden[orden.length - 1].eva;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Dolor EVA de ${primero} a ${ultimo} en ${orden.length} sesiones`}>
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#1b7f8e" strokeOpacity=".12" />
            <text x={L - 6} y={y(v) + 3} fontSize="10" textAnchor="end" fill="#4d6a72">{v}</text>
          </g>
        ))}
        {orden.length > 1 && <polyline points={puntos} fill="none" stroke="#1b7f8e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {orden.map((n, i) => (
          <g key={n.id}>
            <circle cx={x(i)} cy={y(n.eva)} r="6" fill={colorEva(n.eva)} stroke="#fff" strokeWidth="2"><title>{`${n.fecha}: EVA ${n.eva}`}</title></circle>
            {(orden.length <= 8 || i % Math.ceil(orden.length / 8) === 0) && <text x={x(i)} y={H - 10} fontSize="9.5" textAnchor="middle" fill="#4d6a72">{n.fecha.slice(8)}/{n.fecha.slice(5, 7)}</text>}
          </g>
        ))}
      </svg>
      <figcaption className="a-muted mt-1 text-xs">
        Escala EVA (0 sin dolor – 10 máximo). {ultimo < primero ? `Mejoría de ${primero - ultimo} puntos.` : ultimo > primero ? `Aumento de ${ultimo - primero} puntos.` : "Sin cambios."}
      </figcaption>
    </figure>
  );
}

function Evolucion({ notas, onNueva, onEditar }: { notas: Nota[]; onNueva: () => void; onEditar: (n: Nota) => void }) {
  const { act } = useAct();
  const orden = [...notas].sort((a, b) => Number(b.fijada) - Number(a.fijada) || b.fecha.localeCompare(a.fecha));
  if (notas.length === 0)
    return (
      <div className="a-card">
        <Vacio titulo="Aún no hay notas de seguimiento" texto="Registra la primera sesión: dolor (EVA), tratamiento realizado y próxima indicación.">
          <button className="btn btn-primary btn-sm" onClick={onNueva}><IconPlus className="size-4" /> Primera nota</button>
        </Vacio>
      </div>
    );
  return (
    <div className="space-y-5">
      {notas.length > 1 && <div className="a-card a-card-pad"><h2 className="mb-3 font-display text-lg font-semibold text-teal-deep">Evolución del dolor</h2><PainChart notas={notas} /></div>}
      <div className="flex justify-end"><button className="btn btn-primary btn-sm" onClick={onNueva}><IconPlus className="size-4" /> Nueva nota</button></div>
      <ol className="a-timeline space-y-4">
        {orden.map((n) => (
          <li key={n.id} className={`a-card a-card-pad relative ${n.fijada ? "ring-2 ring-[#f2dc9b]" : ""}`}>
            <span className="a-dot" style={{ background: colorEva(n.eva) }} aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-base font-semibold text-teal-deep">{diaNum(n.fecha)}</h3>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: colorEva(n.eva) }}>EVA {n.eva}/10</span>
              {n.fijada && <span className="st st-pendiente"><IconPin className="size-3.5" /> Fijada</span>}
              <span className="ml-auto flex gap-1">
                <button type="button" className="btn-icon" aria-label={n.fijada ? "Quitar de fijadas" : "Fijar nota"} aria-pressed={n.fijada} onClick={() => act(() => guardarNota({ ...n, fijada: !n.fijada }), n.fijada ? "Nota desfijada" : "Nota fijada")}><IconPin /></button>
                <button type="button" className="btn-icon" aria-label="Editar nota" onClick={() => onEditar(n)}><IconEdit /></button>
              </span>
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              {([["Refiere (S)", n.subjetivo], ["Hallazgos (O)", n.objetivo], ["Tratamiento", n.tratamiento], ["Observaciones", n.observaciones], ["Próxima indicación", n.proximaIndicacion]] as const)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className={k === "Próxima indicación" ? "sm:col-span-2 rounded-xl bg-mint/60 p-3" : ""}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
                    <dd className="mt-0.5 whitespace-pre-line">{v}</dd>
                  </div>
                ))}
            </dl>
            <p className="mt-3 text-xs text-muted">Actualizada {fechaHora(n.actualizadoEn)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Citas({ citas, nombreServ, onNueva, onEditar }: { citas: Cita[]; nombreServ: (id: string) => string; onNueva: () => void; onEditar: (c: Cita) => void }) {
  const orden = [...citas].sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  return (
    <div className="a-card overflow-hidden">
      <div className="flex justify-end p-3"><button className="btn btn-primary btn-sm" onClick={onNueva}><IconPlus className="size-4" /> Nueva cita</button></div>
      {orden.length === 0 ? (
        <Vacio titulo="Sin citas" texto="Agenda la primera cita de este paciente." />
      ) : (
        <div className="overflow-x-auto">
          <table className="a-table">
            <thead><tr><th>Fecha</th><th>Hora</th><th>Servicio</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {orden.map((c) => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap">{diaNum(c.fecha)}</td>
                  <td className="font-semibold">{c.hora}</td>
                  <td>{nombreServ(c.servicio)}</td>
                  <td><Estado valor={c.estado} /></td>
                  <td className="text-right"><button type="button" className="btn btn-ghost btn-sm" onClick={() => onEditar(c)}>Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Planes({ planes, onNuevo, onEditar }: { planes: Plan[]; onNuevo: () => void; onEditar: (p: Plan) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button className="btn btn-primary btn-sm" onClick={onNuevo}><IconPlus className="size-4" /> Nuevo plan</button></div>
      {planes.length === 0 ? (
        <div className="a-card"><Vacio titulo="Sin plan de tratamiento" texto="Define objetivo, frecuencia y número de sesiones para seguir el avance." /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {planes.map((p) => {
            const pct = p.sesionesTotales ? Math.min(100, Math.round((p.sesionesHechas / p.sesionesTotales) * 100)) : 0;
            return (
              <article key={p.id} className="a-card a-card-pad">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold text-teal-deep"><IconTarget className="size-5" /> {p.titulo}</h3>
                  <Estado valor={p.estado} />
                </div>
                {p.objetivo && <p className="mt-2 text-sm">{p.objetivo}</p>}
                <p className="mt-2 text-xs text-muted">{p.frecuencia && `${p.frecuencia} · `}desde {diaNum(p.inicio)}</p>
                <div className="mt-3" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: ${p.sesionesHechas} de ${p.sesionesTotales} sesiones`}>
                  <div className="h-2.5 overflow-hidden rounded-full bg-teal/10"><div className="h-full rounded-full bg-gradient-to-r from-teal to-leaf transition-all" style={{ width: `${pct}%` }} /></div>
                  <p className="mt-1 text-xs text-muted">{p.sesionesHechas} de {p.sesionesTotales} sesiones ({pct}%)</p>
                </div>
                {p.notas && <p className="mt-2 whitespace-pre-line text-sm text-muted">{p.notas}</p>}
                <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => onEditar(p)}><IconEdit className="size-4" /> Editar</button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

