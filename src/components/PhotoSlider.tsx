"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type Slide = {
  src: string;
  alt: string;
};

/**
 * Carrusel infinito solo de fotos: se ven 3 a la vez (1 en celular), de borde a borde, y avanzan solas.
 * Al pasar el mouse frena poco a poco. Con "reducir movimiento" se queda quieto y se puede deslizar a mano.
 */
export function PhotoSlider({ slides }: { slides: Slide[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  // Al poner el cursor encima el carrusel frena poco a poco (y vuelve a acelerar al salir), sin cortes bruscos.
  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    let target = 1;
    let raf = 0;
    const step = () => {
      const anim = tr.getAnimations()[0];
      if (!anim) return;
      const next = anim.playbackRate + (target - anim.playbackRate) * 0.06;
      anim.playbackRate = Math.abs(target - next) < 0.01 ? target : next;
      if (anim.playbackRate !== target) raf = requestAnimationFrame(step);
    };
    const go = (t: number) => {
      target = t;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };
    const enter = () => go(0);
    const leave = () => go(1);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (slides.length === 0) return null;
  // Se duplica la lista para que el bucle (-50 %) sea continuo, sin saltos.
  const loop = [...slides, ...slides];

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Fotos de sesiones de fisioterapia y Pilates"
      className="gallery group/gallery overflow-hidden py-4 [container-type:inline-size] motion-reduce:overflow-x-auto"
    >
      <div ref={track} className="gallery-track flex w-max motion-reduce:animate-none" style={{ ["--n" as string]: slides.length }}>
        {loop.map((s, i) => (
          <figure
            key={`${s.src}-${i}`}
            aria-hidden={i >= slides.length ? true : undefined}
            className="group/tile relative mr-4 aspect-[4/3] shrink-0 overflow-hidden rounded-[1.75rem] shadow-lg ring-4 ring-white/80"
            style={{ width: "calc((100cqw - 2rem) / 3)", minWidth: "17rem" }}
          >
            <Image src={s.src} alt={i >= slides.length ? "" : s.alt} fill sizes="(min-width: 1024px) 34vw, 85vw" className="object-cover saturate-[.92] transition-transform duration-700 group-hover/tile:scale-105" />
            <div className="brand-tint" aria-hidden="true" />
          </figure>
        ))}
      </div>
    </div>
  );
}
