"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site, waLink } from "@/lib/site";
import { IconArrow, IconCalendar, IconCheck, IconChat, IconHeart, IconPhone } from "./Icons";
import { WhatsAppIcon } from "./WhatsAppIcon";

export const GRACIAS_KEY = "tanfip:gracias";

type Resumen = { nombre: string; servicio: string; fecha: string; hora: string };

const pasos = [
  { Icon: IconChat, t: "Revisamos tu solicitud", d: "Tania verifica la disponibilidad del horario que elegiste." },
  { Icon: IconPhone, t: "Te contactamos", d: "Recibirás un mensaje o llamada para confirmar tu cita." },
  { Icon: IconHeart, t: "Te atendemos", d: "Empezamos con una valoración pensada para ti." },
];

/** Página de agradecimiento tras enviar el formulario. El resumen viaja por sessionStorage (no por la URL). */
export function GraciasView() {
  const [r, setR] = useState<Resumen | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(GRACIAS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setR(JSON.parse(raw) as Resumen);
    } catch {
      /* sin resumen: se muestra la versión genérica */
    }
  }, []);

  const nombre = r?.nombre?.split(" ")[0];
  const msg = r
    ? `Hola Tania, soy ${r.nombre}. Acabo de solicitar una cita de ${r.servicio} para el ${r.fecha} a las ${r.hora}. Quedo atento/a a tu confirmación.`
    : "Hola Tania, acabo de enviar una solicitud de cita desde la página. Quedo atento/a a tu confirmación.";

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center px-4 pb-16 pt-6 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-leaf/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-[28rem] rounded-full bg-teal/15 blur-3xl" />
      </div>

      <header className="w-full max-w-3xl">
        <Link href="/" aria-label="TANFIP, volver al inicio" className="inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-horizontal-color.svg" alt="TANFIP fisioterapia & pilates" width={200} height={54} className="h-12 w-auto" />
        </Link>
      </header>

      <section className="rise mt-8 w-full max-w-3xl overflow-hidden rounded-[2.5rem] bg-white/90 p-8 text-center shadow-2xl shadow-teal-deep/15 ring-1 ring-white sm:p-12">
        <span className="relative mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-xl">
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-leaf/30 [animation-duration:2.4s]" />
          <IconCheck className="relative size-12" />
        </span>

        <p className="font-script mt-6 text-4xl text-leaf-deep">{nombre ? `¡Gracias, ${nombre}!` : "¡Muchas gracias!"}</p>
        <h1 className="font-display text-3xl font-semibold text-teal-deep sm:text-4xl">Tu solicitud fue enviada</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-muted">
          Recibimos tu ficha y tu solicitud de cita. Tania te contactará pronto para confirmarla.
        </p>

        {r && (
          <dl className="mx-auto mt-7 grid max-w-xl gap-3 rounded-3xl bg-mint/70 p-5 text-left sm:grid-cols-3">
            {[
              ["Servicio", r.servicio],
              ["Día", r.fecha],
              ["Hora", r.hora],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-leaf-deep">{k}</dt>
                <dd className="mt-0.5 font-semibold text-teal-deep">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {site.whatsapp && (
            <a
              href={waLink(msg)}
              target="_blank"
              rel="noopener"
              className="btn bg-[#25d366] text-white shadow-lg shadow-[#128c4a]/25 hover:-translate-y-0.5 hover:bg-[#1fba5a]"
            >
              <WhatsAppIcon className="size-5" /> Avisar por WhatsApp
            </a>
          )}
          {site.phone && (
            <a href={`tel:${site.phone}`} className="btn btn-primary">
              <IconPhone className="size-5" /> Llamar
            </a>
          )}
          <Link href="/" className="btn btn-ghost">
            Volver al inicio <IconArrow />
          </Link>
        </div>
      </section>

      <section className="mt-10 w-full max-w-3xl" aria-labelledby="que-sigue">
        <h2 id="que-sigue" className="text-center font-display text-2xl font-semibold text-teal-deep">
          ¿Qué sigue?
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {pasos.map(({ Icon, t, d }, i) => (
            <li key={t} className="glass rise rounded-3xl p-5 text-center" style={{ animationDelay: `${0.15 * (i + 1)}s` }}>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-teal to-teal-deep text-white shadow-lg">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-3 font-semibold text-teal-deep">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center">
          <Link href="/#agenda" className="inline-flex items-center gap-2 font-semibold text-teal-deep underline-offset-4 hover:underline">
            <IconCalendar className="size-5" /> Agendar otra cita
          </Link>
        </p>
      </section>
    </main>
  );
}
