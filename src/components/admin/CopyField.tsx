"use client";
import { useState } from "react";

/** Campo de solo lectura con botón para copiar (el enlace del calendario). */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [ok, setOk] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch {
      /* sin portapapeles: el usuario puede seleccionar el texto */
    }
  };
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input readOnly value={value} onFocus={(e) => e.currentTarget.select()} aria-label={label} className="min-w-0 flex-1 rounded-xl border border-teal/20 bg-white px-3 py-2 text-sm" />
      <button type="button" onClick={copiar} className="btn btn-primary">{ok ? "Copiado" : "Copiar enlace"}</button>
    </div>
  );
}
