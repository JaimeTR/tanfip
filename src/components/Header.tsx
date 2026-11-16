"use client";

import { useEffect, useState } from "react";
import { IconArrow, IconCalendar } from "./Icons";
import { InstallButton } from "./InstallButton";

// Solo lo importante. "Agendar cita" va como botón aparte.
const nav = [
  { id: "servicios", label: "Servicios" },
  { id: "tania", label: "Sobre mí" },
  { id: "galeria", label: "Galería" },
  { id: "preguntas", label: "Preguntas" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    // Umbral con histéresis y SIN cambiar la altura del header: evita el parpadeo al hacer scroll.
    let on = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!on && y > 24) {
        on = true;
        setScrolled(true);
      } else if (on && y < 4) {
        on = false;
        setScrolled(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    [...nav.map((n) => n.id), "agenda"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`mx-auto mt-3 flex h-[4.75rem] max-w-6xl items-center justify-between gap-4 rounded-full px-4 pr-3 transition-[background-color,box-shadow,border-color] duration-300 sm:px-6 sm:pr-4 ${
          scrolled || open
            ? "border border-white/80 bg-white/85 shadow-lg shadow-teal-deep/10 backdrop-blur-md"
            : "border border-transparent bg-transparent"
        }`}
        style={{ width: "min(calc(100% - 1.5rem), 72rem)" }}
      >
        <a href="#" aria-label="TANFIP, inicio" className="shrink-0 transition-transform hover:scale-[1.03]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal-color.svg" alt="TANFIP fisioterapia & pilates" width={220} height={60} className="h-12 w-auto sm:h-[3.25rem]" />
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm font-semibold md:flex">
          {nav.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              aria-current={active === l.id ? "true" : undefined}
              className="navlink uppercase tracking-wider text-teal-deep hover:text-leaf-deep"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#agenda" className="btn btn-primary !min-h-11 !px-5">
            <IconCalendar className="size-5" />
            <span>Agendar cita</span>
          </a>
          <button
            type="button"
            className="burger grid size-11 place-items-center gap-[5px] rounded-full md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* menú móvil */}
      <div
        id="menu-movil"
        inert={!open}
        className={`mx-auto mt-2 overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
        style={{ width: "min(calc(100% - 1.5rem), 72rem)" }}
      >
        <nav aria-label="Menú móvil">
          <ul className="grid gap-1 p-3">
            {nav.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 font-semibold uppercase tracking-wider text-teal-deep hover:bg-mint"
                >
                  {l.label}
                  <IconArrow className="size-4 opacity-50" />
                </a>
              </li>
            ))}
            <li className="px-1 pt-1">
              <InstallButton className="w-full" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
