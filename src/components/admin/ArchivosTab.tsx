"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { eliminarArchivo } from "@/app/admin/actions";
import type { Archivo } from "@/lib/db/types";
import { fechaHora } from "@/lib/admin/format";
import { useAct, useUi, Vacio } from "./ui";

const kb = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Informes, estudios e imágenes del paciente. Solo profesional; PDF/JPG/PNG/WebP hasta 4 MB. */
export function ArchivosTab({ pacienteId, archivos }: { pacienteId: string; archivos: Archivo[] }) {
  const router = useRouter();
  const { toast, confirm } = useUi();
  const { act } = useAct();
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  async function subir(file: File | undefined) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) return toast("El archivo supera 4 MB.", "error");
    setSubiendo(true);
    try {
      const fd = new FormData();
      fd.set("pacienteId", pacienteId);
      fd.set("file", file);
      const r = await fetch("/api/archivos", { method: "POST", body: fd });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (j.ok) {
        toast("Archivo subido");
        router.refresh();
      } else toast(j.error ?? "No se pudo subir el archivo.", "error");
    } catch {
      toast("No se pudo subir. Revisa tu conexión.", "error");
    } finally {
      setSubiendo(false);
      if (input.current) input.current.value = "";
    }
  }

  async function borrar(a: Archivo) {
    if (await confirm({ title: "¿Eliminar archivo?", message: `${a.nombre} se borrará de forma permanente.`, confirmLabel: "Eliminar", danger: true })) {
      await act(() => eliminarArchivo(a.id), "Archivo eliminado");
    }
  }

  return (
    <div className="a-card a-card-pad space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="a-muted text-sm">PDF, JPG, PNG o WebP · máx. 4 MB. Solo la profesional puede verlos.</p>
        <input ref={input} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" id="subir-archivo" onChange={(e) => subir(e.target.files?.[0])} />
        <label htmlFor="subir-archivo" className={`btn btn-primary btn-sm cursor-pointer ${subiendo ? "pointer-events-none opacity-60" : ""}`}>{subiendo ? "Subiendo…" : "Subir archivo"}</label>
      </div>
      {archivos.length === 0 ? (
        <Vacio titulo="Sin archivos" texto="Adjunta informes, estudios o imágenes de este paciente." />
      ) : (
        <ul className="divide-y divide-teal/10">
          {archivos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <a href={`/api/archivos/${a.id}`} target="_blank" rel="noopener" className="block truncate font-semibold text-teal hover:underline">{a.nombre}</a>
                <span className="a-muted block text-xs">{kb(a.tamano)} · {fechaHora(a.creadoEn)}</span>
              </span>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => borrar(a)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
