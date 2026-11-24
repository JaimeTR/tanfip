"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarPaciente, guardarPaciente } from "@/app/admin/actions";
import type { Paciente, Servicio } from "@/lib/db/types";
import { soloFecha } from "@/lib/admin/format";
import { limpiarTelefonoInput } from "@/lib/phone";
import { BodyMap } from "./BodyMap";
import { IconTrash } from "./icons";
import { Campo, Modal, useAct, useUi } from "./ui";

const MOTIVOS = ["Dolor", "Lesión deportiva", "Rehabilitación", "Control de dolor", "Mejorar postura", "Embarazo / posparto", "Bienestar general", "Otro motivo"];
const DESDE = ["Menos de una semana", "Entre 1 y 4 semanas", "Entre 1 y 6 meses", "Más de 6 meses"];

const vacio = (servicio: string) => ({
  nombre: "", edad: "", telefono: "", correo: "", direccion: "", servicio, estado: "activo", motivoConsulta: "", patologia: "",
  zonas: [] as string[], desde: "", antecedentes: "", medicamentos: "", consentimiento: false, consentimientoAt: "",
});

export function PacienteModal({
  open, onClose, paciente, servicios, rol,
}: {
  open: boolean; onClose: () => void; paciente?: Paciente | null; servicios: Servicio[]; rol: string;
}) {
  const [d, setD] = useState(vacio(servicios[0]?.id ?? ""));
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();
  const router = useRouter();
  const clinico = rol === "profesional";

  useEffect(() => {
    if (!open) return;
    setError("");
    setD(paciente ? { ...vacio(""), ...paciente, edad: paciente.edad == null ? "" : String(paciente.edad) } : vacio(servicios[0]?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, paciente?.id]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));

  const guardar = async () => {
    if (d.nombre.trim().length < 3) return setError("Escribe el nombre completo.");
    const r = await act(() => guardarPaciente(d), paciente ? "Paciente actualizado" : "Paciente creado");
    if (r.ok) onClose();
    else setError(r.error);
  };

  const borrar = async () => {
    if (!paciente) return;
    const ok = await confirm({
      title: "¿Eliminar este paciente?",
      message: `Se borrarán también su historia clínica, citas y notas. Esta acción no se puede deshacer.`,
      confirmLabel: "Sí, eliminar",
      danger: true,
    });
    if (!ok) return;
    const r = await act(() => eliminarPaciente(paciente.id), "Paciente eliminado");
    if (r.ok) {
      onClose();
      router.push("/admin/pacientes");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={paciente ? "Editar paciente" : "Nuevo paciente"}
      footer={
        <>
          {paciente && rol === "profesional" && (
            <button type="button" className="btn btn-danger btn-sm mr-auto" onClick={borrar}><IconTrash className="size-4" /> Eliminar</button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={guardar} disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); guardar(); }} className="space-y-6" noValidate>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 font-display text-sm font-semibold text-teal-deep">Datos personales</legend>
          <Campo label="Nombre completo *" htmlFor="p-nombre" className="sm:col-span-2">
            <input id="p-nombre" className="field field-sm" value={d.nombre} onChange={(e) => set("nombre", e.target.value)} maxLength={120} autoComplete="off" aria-invalid={!!error && d.nombre.trim().length < 3} />
          </Campo>
          <Campo label="Edad" htmlFor="p-edad"><input id="p-edad" type="number" min={0} max={120} className="field field-sm" value={d.edad} onChange={(e) => set("edad", e.target.value)} /></Campo>
          <Campo label="Teléfono / WhatsApp" htmlFor="p-tel"><input id="p-tel" type="tel" className="field field-sm" value={d.telefono} onChange={(e) => set("telefono", limpiarTelefonoInput(e.target.value))} maxLength={30} placeholder="949 809 459" /></Campo>
          <Campo label="Correo" htmlFor="p-correo"><input id="p-correo" type="email" className="field field-sm" value={d.correo} onChange={(e) => set("correo", e.target.value)} maxLength={160} /></Campo>
          <Campo label="Residencia" htmlFor="p-dir"><input id="p-dir" className="field field-sm" value={d.direccion} onChange={(e) => set("direccion", e.target.value)} maxLength={200} /></Campo>
          <Campo label="Servicio principal" htmlFor="p-serv">
            <select id="p-serv" className="field field-sm" value={d.servicio} onChange={(e) => set("servicio", e.target.value)}>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Estado" htmlFor="p-estado">
            <select id="p-estado" className="field field-sm" value={d.estado} onChange={(e) => set("estado", e.target.value)}>
              <option value="activo">Activo</option><option value="alta">De alta</option><option value="inactivo">Inactivo</option>
            </select>
          </Campo>
        </fieldset>

        {clinico ? (
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="mb-2 font-display text-sm font-semibold text-teal-deep">Ficha clínica</legend>
            <Campo label="Motivo de consulta" htmlFor="p-motivo">
              <select id="p-motivo" className="field field-sm" value={d.motivoConsulta} onChange={(e) => set("motivoConsulta", e.target.value)}>
                <option value="">—</option>
                {MOTIVOS.concat(d.motivoConsulta && !MOTIVOS.includes(d.motivoConsulta) ? [d.motivoConsulta] : []).map((m) => <option key={m}>{m}</option>)}
              </select>
            </Campo>
            <Campo label="Desde cuándo" htmlFor="p-desde">
              <select id="p-desde" className="field field-sm" value={d.desde} onChange={(e) => set("desde", e.target.value)}>
                <option value="">—</option>
                {DESDE.concat(d.desde && !DESDE.includes(d.desde) ? [d.desde] : []).map((m) => <option key={m}>{m}</option>)}
              </select>
            </Campo>
            <Campo label="Patología / diagnóstico" htmlFor="p-pat" className="sm:col-span-2"><input id="p-pat" className="field field-sm" value={d.patologia} onChange={(e) => set("patologia", e.target.value)} maxLength={200} /></Campo>
            <div className="sm:col-span-2">
              <span className="a-label">Zonas de dolor</span>
              <BodyMap value={d.zonas} onChange={(v) => set("zonas", v)} />
            </div>
            <Campo label="Antecedentes" htmlFor="p-ant"><textarea id="p-ant" className="field" value={d.antecedentes} onChange={(e) => set("antecedentes", e.target.value)} maxLength={1000} /></Campo>
            <Campo label="Medicamentos" htmlFor="p-med"><textarea id="p-med" className="field" value={d.medicamentos} onChange={(e) => set("medicamentos", e.target.value)} maxLength={500} /></Campo>
          </fieldset>
        ) : (
          <p className="rounded-xl bg-mint/70 p-3 text-sm text-muted">La ficha clínica solo la completa y consulta la profesional.</p>
        )}

        <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm">
          <input type="checkbox" className="mt-1 size-4 accent-[#1b7f8e]" checked={d.consentimiento} onChange={(e) => set("consentimiento", e.target.checked)} />
          <span>
            <strong>Consentimiento informado firmado</strong>
            <span className="block text-xs text-muted">
              {d.consentimiento && d.consentimientoAt ? `Registrado el ${soloFecha(d.consentimientoAt)}.` : "Al marcarlo se guarda la fecha de hoy."}
            </span>
          </span>
        </label>

        <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{error}</p>
        <button type="submit" className="sr-only">Guardar</button>
      </form>
    </Modal>
  );
}
