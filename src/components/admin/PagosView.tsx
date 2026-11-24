"use client";
import { useMemo, useState } from "react";
import { eliminarPago, guardarPago } from "@/app/admin/actions";
import { METODOS_PAGO, type MetodoPago, type Pago } from "@/lib/db/types";
import { diaNum, mesAnio } from "@/lib/admin/format";
import { IconPlus } from "./icons";
import { Campo, Modal, useAct, useUi, Vacio } from "./ui";

const soles = (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
const ETIQ: Record<MetodoPago, string> = { efectivo: "Efectivo", yape: "Yape", plin: "Plin", transferencia: "Transferencia", tarjeta: "Tarjeta" };
type Form = { id?: string; pacienteId: string; monto: string; metodo: MetodoPago; fecha: string; concepto: string };

export function PagosView({ pagos, pacientes, hoy, rol, disponible }: { pagos: Pago[]; pacientes: { id: string; nombre: string }[]; hoy: string; rol: string; disponible: boolean }) {
  const [mes, setMes] = useState(hoy.slice(0, 7));
  const [f, setF] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();
  const nombre = (id: string) => pacientes.find((p) => p.id === id)?.nombre ?? "Paciente eliminado";

  const delMes = useMemo(() => pagos.filter((p) => p.fecha.startsWith(mes)), [pagos, mes]);
  const total = delMes.reduce((a, p) => a + p.monto, 0);
  const porMetodo = METODOS_PAGO.map((m) => ({ m, t: delMes.filter((p) => p.metodo === m).reduce((a, p) => a + p.monto, 0) })).filter((x) => x.t > 0);

  const nuevo = () => {
    setError("");
    setF({ pacienteId: pacientes[0]?.id ?? "", monto: "", metodo: "efectivo", fecha: hoy, concepto: "" });
  };
  const guardar = async () => {
    if (!f) return;
    const r = await act(() => guardarPago({ ...f, monto: Number(f.monto.replace(",", ".")) }), f.id ? "Pago actualizado" : "Pago registrado");
    if (r.ok) {
      setF(null);
      setError("");
    } else setError(r.error);
  };
  const borrar = async (p: Pago) => {
    if (await confirm({ title: "¿Eliminar pago?", message: `${soles(p.monto)} de ${nombre(p.pacienteId)}.`, confirmLabel: "Eliminar", danger: true })) {
      await act(() => eliminarPago(p.id), "Pago eliminado");
    }
  };
  const csv = () => {
    const celda = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const filas = [["Fecha", "Paciente", "Método", "Concepto", "Monto"], ...delMes.map((p) => [p.fecha, nombre(p.pacienteId), ETIQ[p.metodo], p.concepto, p.monto.toFixed(2)])];
    const blob = new Blob(["﻿" + filas.map((r) => r.map(celda).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pagos-${mes}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!disponible) {
    return (
      <div className="space-y-4">
        <h1 className="a-h1">Pagos</h1>
        <p className="a-card a-card-pad text-sm text-muted">El registro de pagos funciona con la base Neon o en modo local; con Supabase aún no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="a-h1">Pagos</h1>
          <p className="a-muted text-sm">Registro manual de cobros. {mesAnio(mes + "-01")}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="month" aria-label="Mes" className="field field-sm !w-auto" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} />
          <button type="button" className="btn btn-ghost btn-sm" onClick={csv} disabled={delMes.length === 0}>Descargar CSV</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={nuevo} disabled={pacientes.length === 0}>
            <IconPlus className="size-4" /> Registrar pago
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen del mes">
        <div className="a-card a-card-pad">
          <p className="a-muted text-sm">Ingresos del mes</p>
          <p className="font-display text-3xl font-semibold text-teal-deep">{soles(total)}</p>
          <p className="a-muted text-xs">{delMes.length} {delMes.length === 1 ? "pago" : "pagos"}</p>
        </div>
        <div className="a-card a-card-pad sm:col-span-2">
          <p className="a-muted mb-2 text-sm">Por método</p>
          {porMetodo.length === 0 ? (
            <p className="text-sm text-muted">Sin pagos este mes.</p>
          ) : (
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {porMetodo.map((x) => (
                <li key={x.m} className="text-sm">
                  <span className="a-muted">{ETIQ[x.m]}</span> <span className="font-semibold">{soles(x.t)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="a-card">
        {delMes.length === 0 ? (
          <Vacio titulo="Sin pagos" texto="Registra los cobros de tus sesiones para ver tus ingresos del mes." />
        ) : (
          <ul className="divide-y divide-teal/10">
            {delMes.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block font-semibold">{nombre(p.pacienteId)}</span>
                  <span className="a-muted block truncate text-sm">
                    {diaNum(p.fecha)} · {ETIQ[p.metodo]}
                    {p.concepto ? ` · ${p.concepto}` : ""}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-teal-deep">{soles(p.monto)}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setError("");
                      setF({ id: p.id, pacienteId: p.pacienteId, monto: String(p.monto), metodo: p.metodo, fecha: p.fecha, concepto: p.concepto });
                    }}
                  >
                    Editar
                  </button>
                  {rol === "profesional" && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => borrar(p)}>
                      Eliminar
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={!!f}
        onClose={() => setF(null)}
        title={f?.id ? "Editar pago" : "Registrar pago"}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setF(null)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={guardar}>
              {busy ? "Guardando…" : "Guardar"}
            </button>
          </>
        }
      >
        {f && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              guardar();
            }}
          >
            <Campo label="Paciente" htmlFor="p-pac">
              <select id="p-pac" className="field field-sm" value={f.pacienteId} onChange={(e) => setF({ ...f, pacienteId: e.target.value })}>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Monto (S/)" htmlFor="p-monto">
                <input id="p-monto" inputMode="decimal" className="field field-sm" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} placeholder="80" />
              </Campo>
              <Campo label="Fecha" htmlFor="p-fecha">
                <input id="p-fecha" type="date" className="field field-sm" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
              </Campo>
            </div>
            <Campo label="Método" htmlFor="p-met">
              <select id="p-met" className="field field-sm" value={f.metodo} onChange={(e) => setF({ ...f, metodo: e.target.value as MetodoPago })}>
                {METODOS_PAGO.map((m) => (
                  <option key={m} value={m}>
                    {ETIQ[m]}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Concepto (opcional)" htmlFor="p-con">
              <input id="p-con" className="field field-sm" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} placeholder="Sesión de fisioterapia" maxLength={160} />
            </Campo>
            <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">
              {error}
            </p>
            <button type="submit" className="sr-only">
              Guardar
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
