"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { aceptarSolicitud, horasDisponibles, proponerHora, rechazarSolicitud } from "@/app/admin/actions";
import type { Servicio, Solicitud } from "@/lib/db/types";
import { diaCorto, diaLargo, fechaHora, norm, waLink } from "@/lib/admin/format";
import { IconCheck } from "@/components/Icons";
import { IconClose, IconEye, IconRefresh, IconSearch, IconWhatsapp } from "./icons";
import { Campo, Estado, Modal, useAct, useUi, Vacio } from "./ui";

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "nueva", label: "Nuevas" },
  { id: "aceptada", label: "Aceptadas" },
  { id: "reprogramada", label: "Reprogramadas" },
  { id: "rechazada", label: "Rechazadas" },
] as const;

export function SolicitudesView({ solicitudes, servicios, rol, abrirId }: { solicitudes: Solicitud[]; servicios: Servicio[]; rol: string; abrirId?: string }) {
  const [filtro, setFiltro] = useState<string>("todas");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(abrirId ?? null);
  const nombreServ = (id: string) => servicios.find((s) => s.id === id)?.nombre ?? id;

  const lista = useMemo(() => {
    const n = norm(q.trim());
    return solicitudes.filter((s) => (filtro === "todas" || s.estado === filtro) && (!n || norm(s.nombre).includes(n) || s.telefono.includes(n)));
  }, [solicitudes, filtro, q]);

  const cuenta = (id: string) => (id === "todas" ? solicitudes.length : solicitudes.filter((s) => s.estado === id).length);
  const actual = solicitudes.find((s) => s.id === sel) ?? null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="a-h1">Solicitudes</h1>
          <p className="a-muted text-sm">Lo que llega desde el formulario de la web. Acepta, propón otra hora o rechaza.</p>
        </div>
        <div className="fieldwrap w-full sm:w-72">
          <IconSearch className="size-4" />
          <input className="field field-sm" style={{ paddingLeft: "2.5rem" }} placeholder="Buscar por nombre o teléfono" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar solicitudes" />
        </div>
      </header>

      <div className="a-tabs" role="tablist" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filtro === f.id} className="a-tab" onClick={() => setFiltro(f.id)}>
            {f.label} <span className="opacity-70">({cuenta(f.id)})</span>
          </button>
        ))}
      </div>

      <div className="a-card overflow-hidden">
        {lista.length === 0 ? (
          <Vacio titulo="No hay solicitudes aquí" texto="Cuando alguien complete el formulario de la web, aparecerá en esta bandeja." />
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Recibida</th>
                  <th>Paciente</th>
                  <th className="hidden md:table-cell">Servicio</th>
                  <th>Cita pedida</th>
                  <th>Estado</th>
                  <th><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((s) => (
                  <tr key={s.id} className="a-row-click" onClick={() => setSel(s.id)}>
                    <td className="whitespace-nowrap text-xs text-muted">{fechaHora(s.creadaEn)}</td>
                    <td>
                      <span className="block font-semibold">{s.nombre}</span>
                      <span className="block text-xs text-muted">{s.edad} años · {s.paciente === "nuevo" ? "Paciente nuevo" : "Ya es paciente"}</span>
                    </td>
                    <td className="hidden md:table-cell">{nombreServ(s.servicio)}</td>
                    <td className="whitespace-nowrap">
                      <span className="block capitalize">{diaCorto(s.fecha)}</span>
                      <span className="block text-xs text-muted">{s.hora}</span>
                    </td>
                    <td><Estado valor={s.estado} /></td>
                    <td className="text-right">
                      <button type="button" className="btn-icon" aria-label={`Ver solicitud de ${s.nombre}`} onClick={(e) => { e.stopPropagation(); setSel(s.id); }}>
                        <IconEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Detalle sol={actual} onClose={() => setSel(null)} nombreServ={nombreServ} rol={rol} />
    </div>
  );
}

function Dato({ k, v }: { k: string; v?: string }) {
  if (!v) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
      <dd className="mt-0.5 whitespace-pre-line break-words text-sm">{v}</dd>
    </div>
  );
}

function Detalle({ sol, onClose, nombreServ, rol }: { sol: Solicitud | null; onClose: () => void; nombreServ: (id: string) => string; rol: string }) {
  const { act, busy } = useAct();
  const [modo, setModo] = useState<"ver" | "proponer" | "rechazar" | "avisar">("ver");
  const [aviso, setAviso] = useState<{ msg: string; tipo: "aceptada" | "reprogramada" | "rechazada"; correo: string } | null>(null);
  const { toast } = useUi();
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horas, setHoras] = useState<string[] | null>(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setModo("ver");
    setAviso(null);
    setMotivo("");
    setHora("");
    setHoras(null);
    setFecha(sol?.fecha ?? "");
  }, [sol?.id]);

  useEffect(() => {
    if (modo !== "proponer" || !sol || !fecha) return;
    let vivo = true;
    setHoras(null);
    horasDisponibles(fecha, sol.servicio).then((r) => {
      if (vivo) setHoras(r.ok ? (r.data ?? []) : []);
    });
    return () => {
      vivo = false;
    };
  }, [modo, fecha, sol]);

  if (!sol) return <Modal open={false} onClose={onClose} title="Solicitud">{null}</Modal>;
  const serv = nombreServ(sol.servicio);
  const primero = sol.nombre.split(" ")[0];
  const abierta = sol.estado === "nueva" || sol.estado === "reprogramada";

  const estadoCorreo = (c?: string) => (c === "enviado" ? "También se envió un correo al paciente." : c === "sin_correo" ? "El paciente no dejó un correo válido: avísale por WhatsApp." : c === "no_configurado" ? "El envío de correo aún no está configurado: avísale por WhatsApp." : "No se pudo enviar el correo: avísale por WhatsApp.");
  const msgFinal = (tipo: "aceptada" | "reprogramada" | "rechazada", d: string, h: string, mot = "") =>
    tipo === "aceptada"
      ? `Hola ${primero}, soy Tania de TANFIP 🌿

Tu cita quedó *confirmada*:
• Servicio: ${serv}
• Día: ${diaLargo(d)}
• Hora: ${h}

Si necesitas cambiarla, avísame con anticipación. ¡Te esperamos!`
      : tipo === "reprogramada"
        ? `Hola ${primero}, soy Tania de TANFIP 🌿

Recibí tu solicitud de ${serv} para el ${diaLargo(sol.fecha)} a las ${sol.hora}, pero ese horario no lo tengo disponible.

¿Te sirve el ${diaLargo(d)} a las ${h}? Respóndeme para confirmarlo.`
        : `Hola ${primero}, soy Tania de TANFIP 🌿

Gracias por escribirnos. Por ahora no podré atender tu solicitud de ${serv}${mot ? `: ${mot}` : ""}.
Con gusto te ayudo a buscar otra opción.`;

  const aceptar = async () => {
    const r = await act(() => aceptarSolicitud({ id: sol.id }), "Solicitud aceptada: paciente y cita creados");
    if (r.ok && r.data) {
      setAviso({ tipo: "aceptada", msg: msgFinal("aceptada", r.data.fecha, r.data.hora), correo: estadoCorreo(r.data.correo) });
      setModo("avisar");
    }
  };
  const proponer = async () => {
    const r = await act(() => proponerHora({ id: sol.id, fecha, hora }), "Propuesta registrada");
    if (r.ok && r.data) {
      setAviso({ tipo: "reprogramada", msg: msgFinal("reprogramada", fecha, hora), correo: estadoCorreo(r.data.correo) });
      setModo("avisar");
    }
  };
  const rechazar = async () => {
    const r = await act(() => rechazarSolicitud({ id: sol.id, motivo }), "Solicitud rechazada");
    if (r.ok) {
      setAviso({ tipo: "rechazada", msg: msgFinal("rechazada", "", "", motivo), correo: estadoCorreo(r.data?.correo) });
      setModo("avisar");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={sol.nombre}
      description={`${serv} · ${diaLargo(sol.fecha)} a las ${sol.hora}`}
      footer={
        modo === "ver" ? (
          <>
            <a className="btn btn-ghost btn-sm" href={waLink(sol.telefono, `Hola ${primero}, soy Tania de TANFIP. `)} target="_blank" rel="noopener noreferrer">
              <IconWhatsapp className="size-4" /> WhatsApp
            </a>
            {abierta && (
              <>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setModo("rechazar")}><IconClose className="size-4" /> Rechazar</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModo("proponer")}><IconRefresh className="size-4" /> Proponer otra hora</button>
                <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={aceptar}><IconCheck className="size-4" /> {busy ? "Creando…" : "Aceptar y crear paciente"}</button>
              </>
            )}
            {sol.estado === "aceptada" && sol.pacienteId && (
              <Link href={`/admin/pacientes/${sol.pacienteId}`} className="btn btn-primary btn-sm" onClick={onClose}>Ir a la ficha del paciente</Link>
            )}
          </>
        ) : modo === "proponer" ? (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModo("ver")}>Volver</button>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy || !fecha || !hora} onClick={proponer}><IconWhatsapp className="size-4" /> Guardar y avisar por WhatsApp</button>
          </>
        ) : modo === "rechazar" ? (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModo("ver")}>Volver</button>
            <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={rechazar}>Confirmar rechazo</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setModo("ver"); onClose(); }}>Ahora no</button>
            {aviso?.tipo === "aceptada" && sol.pacienteId && <Link href={`/admin/pacientes/${sol.pacienteId}`} className="btn btn-ghost btn-sm" onClick={onClose}>Ver ficha</Link>}
            <a className="btn btn-primary btn-sm" href={waLink(sol.telefono, aviso?.msg ?? "")} target="_blank" rel="noopener noreferrer" onClick={() => toast("Abriendo WhatsApp con el mensaje listo")}>
              <IconWhatsapp className="size-4" /> Abrir WhatsApp y enviar
            </a>
          </>
        )
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Estado valor={sol.estado} />
        <span className="text-xs text-muted">Recibida {fechaHora(sol.creadaEn)}</span>
        {sol.consentimiento && <span className="st st-confirmada">Consentimiento {fechaHora(sol.consentimientoAt)}</span>}
      </div>

      {modo === "avisar" && aviso && (
        <div className="space-y-4">
          <p className="rounded-xl bg-[#e1f3e6] p-3 text-sm text-[#25683a]">
            {aviso.tipo === "aceptada" ? "Solicitud aprobada. Se creó el paciente y la cita." : aviso.tipo === "reprogramada" ? "Propuesta de nuevo horario registrada." : "Solicitud rechazada."} {aviso.correo}
          </p>
          <Campo label={`Mensaje para ${sol.nombre} (${sol.telefono}) — puedes editarlo`} htmlFor="aviso-msg">
            <textarea id="aviso-msg" className="field" rows={8} value={aviso.msg} onChange={(e) => setAviso({ ...aviso, msg: e.target.value })} />
          </Campo>
          <p className="a-hint">Al pulsar el botón se abre el WhatsApp del paciente con este mensaje ya escrito; solo falta presionar enviar.</p>
        </div>
      )}

      {modo === "ver" && (
        <>
          {sol.estado === "reprogramada" && (
            <p className="mb-4 rounded-xl bg-[#e3eefb] p-3 text-sm text-[#1f5a98]">
              Propuesta enviada: <strong className="capitalize">{diaLargo(sol.propuestaFecha)}</strong> a las <strong>{sol.propuestaHora}</strong>. Si el paciente acepta, pulsa “Aceptar”.
            </p>
          )}
          {sol.estado === "rechazada" && sol.motivoRechazo && <p className="mb-4 rounded-xl bg-[#fbe5e2] p-3 text-sm text-[#9b2f27]">Motivo: {sol.motivoRechazo}</p>}
          {sol.estado === "aceptada" && (
            <p className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#e1f3e6] p-3 text-sm text-[#25683a]">
              <span>Cita confirmada y paciente creado.</span>
              <a className="font-semibold underline" href={waLink(sol.telefono, msgFinal("aceptada", sol.propuestaFecha || sol.fecha, sol.propuestaHora || sol.hora))} target="_blank" rel="noopener noreferrer">Avisar confirmación por WhatsApp</a>
            </p>
          )}
          <dl className="grid gap-4 sm:grid-cols-2">
            <Dato k="Teléfono" v={sol.telefono} />
            <Dato k="Correo" v={sol.correo} />
            <Dato k="Edad" v={`${sol.edad} años`} />
            <Dato k="Tipo" v={sol.paciente === "nuevo" ? "Paciente nuevo" : "Ya es paciente"} />
            <Dato k="Motivo de consulta" v={sol.motivoConsulta} />
            <Dato k="Desde cuándo" v={sol.desde} />
            <Dato k="Zonas de dolor" v={sol.zonas.join(", ")} />
            <Dato k="Patología / diagnóstico" v={sol.patologia} />
            <Dato k="Antecedentes" v={sol.antecedentes} />
            <Dato k="Medicamentos" v={sol.medicamentos} />
            <Dato k="Dirección" v={sol.direccion} />
            <Dato k="Información adicional" v={sol.adicional} />
          </dl>
          {rol === "recepcion" && <p className="mt-4 text-xs text-muted">Los datos clínicos se muestran solo a la profesional.</p>}
        </>
      )}

      {modo === "proponer" && (
        <div className="space-y-4">
          <p className="a-muted text-sm">Elige otro día y una hora libre. Se abrirá WhatsApp con el mensaje listo para enviar.</p>
          <Campo label="Día" htmlFor="prop-fecha">
            <input id="prop-fecha" type="date" className="field field-sm sm:w-56" value={fecha} onChange={(e) => { setFecha(e.target.value); setHora(""); }} />
          </Campo>
          <div>
            <span className="a-label">Horas libres</span>
            {horas === null ? (
              <div className="a-skeleton h-10 w-full" aria-busy="true" />
            ) : horas.length === 0 ? (
              <p className="text-sm text-muted">No hay horas libres ese día (cerrado, bloqueado o lleno). Prueba con otra fecha.</p>
            ) : (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Horas libres">
                {horas.map((h) => (
                  <button key={h} type="button" aria-pressed={hora === h} onClick={() => setHora(h)} className="chip rounded-full border-2 border-teal/15 bg-white px-4 py-1.5 text-sm font-medium">{h}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modo === "rechazar" && (
        <Campo label="Motivo (opcional, se incluye en el mensaje)" htmlFor="rech-motivo">
          <textarea id="rech-motivo" className="field" maxLength={300} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Ese día no atendemos. Te propongo escribirnos para otra fecha." />
        </Campo>
      )}
    </Modal>
  );
}

