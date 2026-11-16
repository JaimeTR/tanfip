"use client";
import { useEffect, useState } from "react";
import { eliminarCita, guardarCita, horasDisponibles } from "@/app/admin/actions";
import type { Cita, Servicio } from "@/lib/db/types";
import { IconTrash } from "./icons";
import { Campo, Modal, useAct, useUi } from "./ui";

export type CitaDefaults = { pacienteId?: string; fecha?: string; hora?: string };
type Opcion = { id: string; nombre: string };

export function CitaModal({
  open, onClose, cita, defaults, pacientes, servicios, rol, hoy,
}: {
  open: boolean; onClose: () => void; cita?: Cita | null; defaults?: CitaDefaults; pacientes: Opcion[]; servicios: Servicio[]; rol: string; hoy: string;
}) {
  const [d, setD] = useState({ id: "", pacienteId: "", servicio: "", fecha: "", hora: "", duracionMin: 60, estado: "pendiente", notas: "" });
  const [horas, setHoras] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();

  useEffect(() => {
    if (!open) return;
    setError("");
    if (cita) setD({ id: cita.id, pacienteId: cita.pacienteId, servicio: cita.servicio, fecha: cita.fecha, hora: cita.hora, duracionMin: cita.duracionMin, estado: cita.estado, notas: cita.notas });
    else {
      const s = servicios.find((x) => x.activo) ?? servicios[0];
      setD({ id: "", pacienteId: defaults?.pacienteId ?? "", servicio: s?.id ?? "", fecha: defaults?.fecha ?? hoy, hora: defaults?.hora ?? "", duracionMin: s?.duracionMin ?? 60, estado: "confirmada", notas: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cita?.id]);

  useEffect(() => {
    if (!open || !d.fecha || !d.servicio) return;
    let vivo = true;
    setHoras(null);
    horasDisponibles(d.fecha, d.servicio, d.id || undefined).then((r) => {
      if (vivo) setHoras(r.ok ? (r.data ?? []) : []);
    });
    return () => {
      vivo = false;
    };
  }, [open, d.fecha, d.servicio, d.id]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));

  const guardar = async () => {
    if (!d.pacienteId) return setError("Elige un paciente.");
    if (!d.hora) return setError("Elige o escribe una hora.");
    const r = await act(() => guardarCita(d), cita ? "Cita actualizada" : "Cita creada");
    if (r.ok) onClose();
    else setError(r.error);
  };

  const borrar = async () => {
    if (!cita) return;
    if (!(await confirm({ title: "¿Eliminar esta cita?", message: "Si solo no asistirá, mejor cámbiala a “Cancelada” para conservar el registro.", confirmLabel: "Eliminar", danger: true }))) return;
    const r = await act(() => eliminarCita(cita.id), "Cita eliminada");
    if (r.ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cita ? "Editar / reprogramar cita" : "Nueva cita"}
      footer={
        <>
          {cita && rol === "profesional" && <button type="button" className="btn btn-danger btn-sm mr-auto" onClick={borrar}><IconTrash className="size-4" /> Eliminar</button>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={busy}>{busy ? "Guardando…" : "Guardar cita"}</button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Campo label="Paciente *" htmlFor="c-pac" className="sm:col-span-2">
          <select id="c-pac" className="field field-sm" value={d.pacienteId} onChange={(e) => set("pacienteId", e.target.value)}>
            <option value="">Elegir paciente…</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </Campo>
        <Campo label="Servicio" htmlFor="c-serv">
          <select
            id="c-serv" className="field field-sm" value={d.servicio}
            onChange={(e) => {
              const s = servicios.find((x) => x.id === e.target.value);
              setD((x) => ({ ...x, servicio: e.target.value, duracionMin: s?.duracionMin ?? x.duracionMin, hora: "" }));
            }}
          >
            {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}{s.activo ? "" : " (inactivo)"}</option>)}
          </select>
        </Campo>
        <Campo label="Estado" htmlFor="c-estado">
          <select id="c-estado" className="field field-sm" value={d.estado} onChange={(e) => set("estado", e.target.value)}>
            <option value="pendiente">Pendiente</option><option value="confirmada">Confirmada</option><option value="atendida">Atendida</option>
            <option value="cancelada">Cancelada</option><option value="no_asistio">No asistió</option>
          </select>
        </Campo>
        <Campo label="Fecha" htmlFor="c-fecha">
          <input id="c-fecha" type="date" className="field field-sm" value={d.fecha} onChange={(e) => { set("fecha", e.target.value); set("hora", ""); }} />
        </Campo>
        <Campo label="Duración (min)" htmlFor="c-dur">
          <input id="c-dur" type="number" min={10} max={480} step={5} className="field field-sm" value={d.duracionMin} onChange={(e) => set("duracionMin", Number(e.target.value))} />
        </Campo>

        <div className="sm:col-span-2">
          <span className="a-label">Horas libres ese día</span>
          {horas === null ? (
            <div className="a-skeleton h-10" aria-busy="true" />
          ) : horas.length === 0 ? (
            <p className="text-sm text-muted">No hay horas libres (cerrado, bloqueado o completo). Puedes escribir una hora manualmente.</p>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Horas libres">
              {horas.map((h) => (
                <button key={h} type="button" aria-pressed={d.hora === h} onClick={() => set("hora", h)} className="chip rounded-full border-2 border-teal/15 bg-white px-3.5 py-1 text-sm font-medium">{h}</button>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <label htmlFor="c-hora" className="text-sm text-muted">Hora elegida:</label>
            <input id="c-hora" type="time" className="field field-sm w-36" value={d.hora} onChange={(e) => set("hora", e.target.value)} step={300} />
          </div>
        </div>

        <Campo label="Notas de la cita" htmlFor="c-notas" className="sm:col-span-2">
          <textarea id="c-notas" className="field" maxLength={500} value={d.notas} onChange={(e) => set("notas", e.target.value)} placeholder="Ej. Traer informe de resonancia" />
        </Campo>
        <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27] sm:col-span-2">{error}</p>
        <button type="submit" className="sr-only">Guardar</button>
      </form>
    </Modal>
  );
}
