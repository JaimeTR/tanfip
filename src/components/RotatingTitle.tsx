"use client";

import { useEffect, useState } from "react";

const frases: { l1: string; l2: string; desc: string }[] = [
  {
    l1: "Fisioterapia",
    l2: "que te alivia",
    desc: "Valoración completa, terapia manual y ejercicio terapéutico para aliviar el dolor de espalda, cuello y articulaciones, y recuperarte de lesiones o cirugías.",
  },
  {
    l1: "Pilates en Mat",
    l2: "que te fortalece",
    desc: "Clases guiadas para fortalecer el core, mejorar tu postura, ganar flexibilidad y moverte con control, a tu nivel y a tu ritmo.",
  },
];

/**
 * Titular y descripción que cambian juntos como un slider. El H1 real (para SEO y lectores de pantalla)
 * es el texto estático de `seo`; el titular animado es decorativo (aria-hidden).
 */
export function RotatingTitle({ seo, className = "", descClassName = "" }: { seo: string; className?: string; descClassName?: string }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t2: ReturnType<typeof setTimeout>;
    const t = setInterval(() => {
      setShow(false);
      t2 = setTimeout(() => {
        setI((n) => (n + 1) % frases.length);
        setShow(true);
      }, 400);
    }, 5200);
    return () => {
      clearInterval(t);
      clearTimeout(t2);
    };
  }, []);

  const f = frases[i];
  const anim = `transition-all duration-500 ease-out ${show ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`;

  return (
    <>
      <h1 className={className}>
        <span className="sr-only">{seo}</span>
        <span aria-hidden="true" className={`block min-h-[2.2em] ${anim}`}>
          {f.l1}
          <span className="block text-leaf-deep">{f.l2}</span>
        </span>
      </h1>
      <p className={`${descClassName} min-h-[8.5rem] sm:min-h-[7.5rem] ${anim}`}>{f.desc}</p>
    </>
  );
}
