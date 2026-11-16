"use client";
import { useEffect, useState } from "react";
import { eliminarNota, eliminarPlan, guardarNota, guardarPlan } from "@/app/admin/actions";
import type { Nota, Plan } from "@/lib/db/types";
import { colorEva } from "@/lib/admin/format";
import { IconTrash } from "./icons";
import { Campo, Modal, useAct, useUi } from "./ui";

/* ---------- Nota de seguimiento (SOAP simple + EVA) ---------- */
export function NotaModal({ open, onClose, nota, pacienteId, hoy }: { open: boolean; onClose: () => void; nota?: Nota | null; pacienteId: string; hoy: string }) {
  const vacia = { id: "", pacienteId, citaId: "", fecha: hoy, eva: 5, subjetivo: "", objetivo: "", tratamiento: "", observaciones: "", proximaIndicacion: "", fijada: false };
  const [d, setD] = useState(vacia);
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();

  useEffect(() => {
    if (!open) return;
    setError("");
    setD(nota ? { ...vacia, ...nota } : vacia);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nota?.id]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));
  const guardar = async () => {
    const r = await act(() => guardarNota(d), nota ? "Nota actualizada" : "Nota guardada");
    if (r.ok) onClose();
    else setError(r.error);
  };
  const borrar = async () => {
    if (!nota) return;
    if (!(await confirm({ title: "¿Eliminar esta nota?", message: "Se borrará de la historia clínica. No se puede deshacer.", confirmLabel: "Eliminar", danger: true }))) return;
    const r = await act(() => eliminarNota(nota.id), "Nota eliminada");
    if (r.ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={nota ? "Editar nota de seguimiento" : "Nueva nota de seguimiento"}
      footer={
        <>
          {nota && <button type="button" className="btn btn-danger btn-sm mr-auto" onClick={borrar}><IconTrash className="size-4" /> Eliminar</button>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={busy}>{busy ? "Guardando…" : "Guardar nota"}</button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Campo label="Fecha de la sesión" htmlFor="n-fecha"><input id="n-fecha" type="date" className="field field-sm" value={d.fecha} onChange={(e) => set("fecha", e.target.value)} /></Campo>
        <fieldset>
          <legend className="a-label">Dolor (EVA 0–10): <strong style={{ color: colorEva(d.eva) }}>{d.eva}</strong></legend>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, i) => (
              <button key={i} type="button" className="eva-btn" aria-pressed={d.eva === i} onClick={() => set("eva", i)} style={d.eva === i ? { background: colorEva(i) } : undefined} aria-label={`Dolor ${i}`}>{i}</button>
            ))}
          </div>
        </fieldset>
        <Campo label="S · Lo que refiere el paciente" htmlFor="n-s" className="sm:col-span-2"><textarea id="n-s" className="field" value={d.subjetivo} maxLength={2000} onChange={(e) => set("subjetivo", e.target.value)} placeholder="Síntomas, cómo se ha sentido desde la última sesión…" /></Campo>
        <Campo label="O · Hallazgos / valoración" htmlFor="n-o" className="sm:col-span-2"><textarea id="n-o" className="field" value={d.objetivo} maxLength={2000} onChange={(e) => set("objetivo", e.target.value)} placeholder="Rango de movimiento, fuerza, palpación…" /></Campo>
        <Campo label="Tratamiento realizado" htmlFor="n-t" className="sm:col-span-2"><textarea id="n-t" className="field" value={d.tratamiento} maxLength={2000} onChange={(e) => set("tratamiento", e.target.value)} /></Campo>
        <Campo label="Observaciones" htmlFor="n-ob"><textarea id="n-ob" className="field" value={d.observaciones} maxLength={2000} onChange={(e) => set("observaciones", e.target.value)} /></Campo>
        <Campo label="Próxima indicación" htmlFor="n-p"><textarea id="n-p" className="field" value={d.proximaIndicacion} maxLength={1000} onChange={(e) => set("proximaIndicacion", e.target.value)} placeholder="Ejercicios en casa, cuidados, próxima sesión…" /></Campo>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" className="size-4 accent-[#1b7f8e]" checked={d.fijada} onChange={(e) => set("fijada", e.target.checked)} />
          Fijar esta nota arriba (alertas o datos importantes)
        </label>
        <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27] sm:col-span-2">{error}</p>
        <button type="submit" className="sr-only">Guardar</button>
      </form>
    </Modal>
  );
}

/* ---------- Plan de tratamiento ---------- */
export function PlanModal({ open, onClose, plan, pacienteId, hoy }: { open: boolean; onClose: () => void; plan?: Plan | null; pacienteId: string; hoy: string }) {
  const vacio = { id: "", pacienteId, titulo: "", objetivo: "", frecuencia: "", sesionesTotales: 10, sesionesHechas: 0, inicio: hoy, estado: "activo", notas: "" };
  const [d, setD] = useState(vacio);
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();

  useEffect(() => {
    if (!open) return;
    setError("");
    setD(plan ? { ...vacio, ...plan } : vacio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, plan?.id]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));
  const guardar = async () => {
    const r = await act(() => guardarPlan(d), plan ? "Plan actualizado" : "Plan creado");
    if (r.ok) onClose();
    else setError(r.error);
  };
  const borrar = async () => {
    if (!plan) return;
    if (!(await confirm({ title: "¿Eliminar este plan?", confirmLabel: "Eliminar", danger: true, message: "No se puede deshacer." }))) return;
    const r = await act(() => eliminarPlan(plan.id), "Plan eliminado");
    if (r.ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={plan ? "Editar plan de tratamiento" : "Nuevo plan de tratamiento"}
      footer={
        <>
          {plan && <button type="button" className="btn btn-danger btn-sm mr-auto" onClick={borrar}><IconTrash className="size-4" /> Eliminar</button>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={busy}>{busy ? "Guardando…" : "Guardar plan"}</button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Campo label="Título *" htmlFor="pl-t" className="sm:col-span-2"><input id="pl-t" className="field field-sm" value={d.titulo} maxLength={120} onChange={(e) => set("titulo", e.target.value)} placeholder="Ej. Control de lumbalgia" /></Campo>
        <Campo label="Objetivo" htmlFor="pl-o" className="sm:col-span-2"><textarea id="pl-o" className="field" value={d.objetivo} maxLength={500} onChange={(e) => set("objetivo", e.target.value)} /></Campo>
        <Campo label="Frecuencia" htmlFor="pl-f"><input id="pl-f" className="field field-sm" value={d.frecuencia} maxLength={80} onChange={(e) => set("frecuencia", e.target.value)} placeholder="2 veces por semana" /></Campo>
        <Campo label="Inicio" htmlFor="pl-i"><input id="pl-i" type="date" className="field field-sm" value={d.inicio} onChange={(e) => set("inicio", e.target.value)} /></Campo>
        <Campo label="Sesiones previstas" htmlFor="pl-st"><input id="pl-st" type="number" min={0} max={500} className="field field-sm" value={d.sesionesTotales} onChange={(e) => set("sesionesTotales", Number(e.target.value))} /></Campo>
        <Campo label="Sesiones realizadas" htmlFor="pl-sh"><input id="pl-sh" type="number" min={0} max={500} className="field field-sm" value={d.sesionesHechas} onChange={(e) => set("sesionesHechas", Number(e.target.value))} /></Campo>
        <Campo label="Estado" htmlFor="pl-e" className="sm:col-span-2">
          <select id="pl-e" className="field field-sm" value={d.estado} onChange={(e) => set("estado", e.target.value)}>
            <option value="activo">Activo</option><option value="pausado">Pausado</option><option value="completado">Completado</option>
          </select>
        </Campo>
        <Campo label="Notas" htmlFor="pl-n" className="sm:col-span-2"><textarea id="pl-n" className="field" value={d.notas} maxLength={1000} onChange={(e) => set("notas", e.target.value)} /></Campo>
        <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27] sm:col-span-2">{error}</p>
        <button type="submit" className="sr-only">Guardar</button>
      </form>
    </Modal>
  );
}
