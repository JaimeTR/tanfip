"use client";

import { useEffect, useRef, useState } from "react";
import { consultas, site, waLink } from "@/lib/site";
import { IconPhone } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Botón flotante abajo a la derecha: elige el tipo de consulta y abre WhatsApp con el mensaje listo, o llama. */
export function ContactFab() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (!site.whatsapp) return null;

  return (
    <div ref={ref} className="pointer-events-none fixed bottom-4 right-4 z-[55] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        id="contacto-panel"
        role="dialog"
        aria-label="Contactar por WhatsApp"
        inert={!open}
        className={`w-[min(21rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-teal-deep/25 transition-all duration-300 ${
          open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        {/* cabecera tipo chat */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-[#1faa59] to-[#0f7a40] px-4 py-3.5 text-white">
          <span className="relative shrink-0">
            <span className="grid size-12 place-items-center rounded-full bg-white p-2 shadow-md ring-2 ring-white/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/isotipo-color.svg" alt="" className="size-full object-contain" />
            </span>
            <span className="absolute bottom-0 right-0 size-3.5 rounded-full bg-[#7CFF9F] ring-2 ring-[#1faa59]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold leading-tight">{site.owner}</span>
            <span className="flex items-center gap-1.5 text-sm text-white/90">
              <span className="size-2 animate-pulse rounded-full bg-[#7CFF9F]" aria-hidden="true" /> En línea
            </span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
            className="grid size-9 shrink-0 place-items-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* conversación */}
        <div className="bg-[#eaf3ee] px-4 py-4">
          <p className="relative max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[0.95rem] leading-snug text-ink shadow-sm">
            Hola, soy Tania. ¿Qué tipo de consulta necesitas?
            <span className="mt-1 block text-right text-[0.7rem] text-muted">Elige una opción para escribirme</span>
          </p>

          <ul className="mt-3 grid gap-2">
            {consultas.map((c) => (
              <li key={c.id}>
                <a
                  href={waLink(c.msg)}
                  target="_blank"
                  rel="noopener"
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between gap-3 rounded-full border border-[#1faa59]/35 bg-white px-4 py-2.5 transition hover:-translate-y-0.5 hover:border-[#1faa59] hover:bg-[#f2fbf5] hover:shadow-md"
                >
                  <span className="min-w-0">
                    <span className="block font-semibold leading-tight text-teal-deep">{c.label}</span>
                    <span className="block truncate text-xs text-muted">{c.hint}</span>
                  </span>
                  <WhatsAppIcon className="size-5 shrink-0 text-[#1faa59] transition group-hover:scale-110" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-teal/10 bg-white p-2">
          <a href={`tel:${site.phone}`} className="flex items-center gap-3 rounded-2xl px-3 py-2 font-semibold text-teal-deep transition hover:bg-mint">
            <span className="grid size-9 place-items-center rounded-full bg-teal/10">
              <IconPhone className="size-5" />
            </span>
            <span>
              Prefiero llamar
              <span className="block text-sm font-normal text-muted">{site.phoneDisplay}</span>
            </span>
          </a>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="contacto-panel"
        aria-label={open ? "Cerrar contacto" : "Contactar por WhatsApp o llamada"}
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto group relative grid size-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl shadow-[#128c4a]/40 transition hover:scale-105"
      >
        {!open && <span aria-hidden="true" className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.6s]" />}
        {open ? (
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <WhatsAppIcon className="size-8" />
        )}
      </button>
    </div>
  );
}
