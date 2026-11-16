"use client";
import { useState } from "react";
import { guardarSitio } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/db/types";
import { IconPlus, IconTrash } from "./icons";
import { Campo, useAct } from "./ui";

export function SitioView({ inicial }: { inicial: SiteSettings }) {
  const [d, setD] = useState(inicial);
  const { act, busy } = useAct();
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setD((x) => ({ ...x, [k]: v }));
  const cambiado = JSON.stringify(d) !== JSON.stringify(inicial);

  const setFaq = (i: number, patch: Partial<{ q: string; a: string }>) => set("faqs", d.faqs.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); act(() => guardarSitio(d), "Textos de la web guardados"); }}>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="a-h1">Sitio web</h1>
          <p className="a-muted text-sm">Edita los textos y datos de contacto que se muestran en la página.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !cambiado}>{busy ? "Guardando…" : "Guardar cambios"}</button>
      </header>

      <section className="a-card a-card-pad grid gap-4 sm:grid-cols-2" aria-labelledby="s-portada">
        <h2 id="s-portada" className="font-display text-lg font-semibold text-teal-deep sm:col-span-2">Portada</h2>
        <Campo label="Titular" htmlFor="s-t" hint="Vacío = se usa el titular original de la web." className="sm:col-span-2">
          <input id="s-t" className="field field-sm" value={d.heroTitulo} maxLength={120} onChange={(e) => set("heroTitulo", e.target.value)} placeholder="Muévete sin dolor, recupera tu equilibrio" />
        </Campo>
        <Campo label="Descripción" htmlFor="s-d" className="sm:col-span-2">
          <textarea id="s-d" className="field" rows={3} value={d.heroDescripcion} maxLength={400} onChange={(e) => set("heroDescripcion", e.target.value)} />
        </Campo>
      </section>

      <section className="a-card a-card-pad grid gap-4 sm:grid-cols-2" aria-labelledby="s-contacto">
        <h2 id="s-contacto" className="font-display text-lg font-semibold text-teal-deep sm:col-span-2">Contacto y horarios</h2>
        <Campo label="WhatsApp" htmlFor="s-w" hint="Con código de país, solo números. Ej. 593999999999"><input id="s-w" inputMode="numeric" className="field field-sm" value={d.whatsapp} maxLength={20} onChange={(e) => set("whatsapp", e.target.value)} /></Campo>
        <Campo label="Correo" htmlFor="s-c"><input id="s-c" type="email" className="field field-sm" value={d.correo} maxLength={160} onChange={(e) => set("correo", e.target.value)} /></Campo>
        <Campo label="Dirección" htmlFor="s-dir"><input id="s-dir" className="field field-sm" value={d.direccion} maxLength={200} onChange={(e) => set("direccion", e.target.value)} /></Campo>
        <Campo label="Horarios (texto visible)" htmlFor="s-h"><input id="s-h" className="field field-sm" value={d.horarios} maxLength={200} onChange={(e) => set("horarios", e.target.value)} placeholder="Lun–Vie 8:00–18:00 · Sáb 8:00–12:00" /></Campo>
        <Campo label="Instagram" htmlFor="s-i" hint="Solo el usuario, sin @"><input id="s-i" className="field field-sm" value={d.instagram} maxLength={80} onChange={(e) => set("instagram", e.target.value)} /></Campo>
      </section>

      <section className="a-card a-card-pad space-y-4" aria-labelledby="s-faq">
        <div className="flex items-center justify-between">
          <h2 id="s-faq" className="font-display text-lg font-semibold text-teal-deep">Preguntas frecuentes</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => set("faqs", [...d.faqs, { q: "", a: "" }])}><IconPlus className="size-4" /> Agregar</button>
        </div>
        {d.faqs.map((f, i) => (
          <div key={i} className="grid gap-3 rounded-2xl bg-white/70 p-4">
            <div className="flex items-end gap-2">
              <Campo label={`Pregunta ${i + 1}`} htmlFor={`f-q-${i}`} className="flex-1"><input id={`f-q-${i}`} className="field field-sm" value={f.q} maxLength={200} onChange={(e) => setFaq(i, { q: e.target.value })} /></Campo>
              <button type="button" className="btn-icon mb-0.5" aria-label={`Quitar pregunta ${i + 1}`} onClick={() => set("faqs", d.faqs.filter((_, j) => j !== i))}><IconTrash /></button>
            </div>
            <Campo label="Respuesta" htmlFor={`f-a-${i}`}><textarea id={`f-a-${i}`} className="field" rows={2} value={f.a} maxLength={1000} onChange={(e) => setFaq(i, { a: e.target.value })} /></Campo>
          </div>
        ))}
        {d.faqs.length === 0 && <p className="text-sm text-muted">Sin preguntas: se usarán las originales de la web.</p>}
      </section>

      <p className="text-xs text-muted">Estos textos se guardan en el panel. La web los leerá cuando se conecte a esta configuración.</p>
    </form>
  );
}
