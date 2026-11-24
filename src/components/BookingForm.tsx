"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GRACIAS_KEY } from "./GraciasView";
import { services, site } from "@/lib/site";
import { formatoTelefono, limpiarTelefonoInput } from "@/lib/phone";
import {
  IconArrow,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClipboard,
  IconClock,
  IconHeart,
  IconId,
  IconLock,
  IconMail,
  IconPhone,
  IconPilates,
  IconPin,
  IconShield,
  IconUser,
} from "./Icons";

type Status = "idle" | "sending" | "ok" | "error";

const MORNING = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const AFTERNOON = ["15:00", "16:00", "17:00", "18:00"];

const STEPS = [
  { label: "Servicio", hint: "Elige lo que necesitas", Icon: IconHeart },
  { label: "Fecha y hora", hint: "Cuándo te acomoda", Icon: IconCalendar },
  { label: "Tus datos", hint: "Datos personales", Icon: IconUser },
  { label: "Motivo", hint: "Qué te molesta", Icon: IconClipboard },
  { label: "Antecedentes", hint: "Historial y ubicación", Icon: IconShield },
  { label: "Confirmar", hint: "Revisa y envía", Icon: IconCheck },
] as const;
const LAST = STEPS.length - 1;

const MOTIVOS = [
  "Presento dolor o molestia física",
  "Tengo una patología diagnosticada",
  "Necesito rehabilitación postoperatoria",
  "Presento una lesión deportiva",
  "Deseo prevenir lesiones o mejorar mi movilidad",
  "Otro motivo",
];
const DESDE = ["Menos de una semana", "Entre 1 y 4 semanas", "Entre 1 y 6 meses", "Más de 6 meses"];

// Zonas del cuerpo y su posición en el muñeco (viewBox 0 0 140 300)
const ZONAS: { name: string; pts: [number, number][] }[] = [
  { name: "Cuello", pts: [[70, 50]] },
  { name: "Hombro", pts: [[42, 66], [98, 66]] },
  { name: "Brazo / Codo", pts: [[30, 104], [110, 104]] },
  { name: "Muñeca / Mano", pts: [[22, 158], [118, 158]] },
  { name: "Espalda alta", pts: [[70, 88]] },
  { name: "Espalda baja / Lumbar", pts: [[70, 126]] },
  { name: "Cadera", pts: [[52, 156], [88, 156]] },
  { name: "Muslo / Rodilla", pts: [[58, 206], [82, 206]] },
  { name: "Pierna / Tobillo", pts: [[56, 248], [84, 248]] },
  { name: "Pie", pts: [[54, 283], [86, 283]] },
];

type Day = { iso: string; wd: string; num: number; mon: string; label: string };

function buildDays(count = 14): Day[] {
  const wd = new Intl.DateTimeFormat("es", { weekday: "short" });
  const mon = new Intl.DateTimeFormat("es", { month: "short" });
  const full = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" });
  const out: Day[] = [];
  const base = new Date();
  // Se reserva con al menos 1 día de anticipación: el primer día disponible es mañana.
  for (let i = 1; i <= count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ iso, wd: wd.format(d).replace(".", ""), num: d.getDate(), mon: mon.format(d).replace(".", ""), label: full.format(d) });
  }
  return out;
}

const initial = {
  servicio: services[0].id as string,
  paciente: "nuevo",
  fecha: "",
  hora: "",
  nombre: "",
  dni: "",
  edad: "",
  telefono: "",
  correo: "",
  motivoConsulta: "",
  patologia: "",
  zonas: [] as string[],
  desde: "",
  antecedentes: "",
  medicamentos: "",
  direccion: "",
  adicional: "",
  consentimiento: false,
  web: "",
};

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [status, setStatus] = useState<Status>("idle");
  const [days, setDays] = useState<Day[]>([]);
  const [hoy, setHoy] = useState("");
  const [d, setD] = useState(initial);
  const heading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const first = useRef(true);

  useEffect(() => {
    setDays(buildDays());
    setHoy(new Intl.DateTimeFormat("es", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date()));
  }, []);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    heading.current?.focus({ preventScroll: true });
  }, [step, status]);

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((p) => ({ ...p, [k]: v }));
  const toggleZona = (z: string) => set("zonas", d.zonas.includes(z) ? d.zonas.filter((x) => x !== z) : [...d.zonas, z]);

  const phoneOk = d.telefono.replace(/\D/g, "").length >= 7;
  const emailOk = d.correo === "" || /^\S+@\S+\.\S+$/.test(d.correo);
  const edadN = Number(d.edad);
  const edadOk = Number.isInteger(edadN) && edadN >= 1 && edadN <= 110;
  const valid = useMemo(
    () => [!!d.servicio, !!d.fecha && !!d.hora, d.nombre.trim().length >= 3 && edadOk && phoneOk && emailOk, !!d.motivoConsulta, true, d.consentimiento],
    [d, phoneOk, emailOk, edadOk]
  );

  const service = services.find((s) => s.id === d.servicio)!;
  const day = days.find((x) => x.iso === d.fecha);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const go = (n: number) => {
    setDir(n > step ? "next" : "prev");
    setStep(n);
  };

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) throw new Error();
      try {
        sessionStorage.setItem(GRACIAS_KEY, JSON.stringify({ nombre: d.nombre, servicio: service.title, fecha: day?.label ?? d.fecha, hora: d.hora }));
      } catch {
        /* sin sessionStorage: la página de gracias muestra la versión genérica */
      }
      setStatus("ok");
      router.push("/gracias");
    } catch {
      setStatus("error");
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid[step]) return;
    if (step < LAST) go(step + 1);
    else submit();
  }

  function reset() {
    setD({ ...initial, nombre: d.nombre, edad: d.edad, telefono: d.telefono, correo: d.correo });
    setStatus("idle");
    setStep(0);
  }

  const whatsappHref = site.whatsapp
    ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
        `Hola, soy ${d.nombre}. Solicité una cita de ${service.title} para el ${day?.label ?? d.fecha} a las ${d.hora}.`
      )}`
    : "";

  if (status === "ok") {
    return (
      <div role="status" className="rise overflow-hidden rounded-[2rem] bg-white/90 p-10 text-center shadow-2xl ring-1 ring-white sm:p-14">
        <span className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-xl">
          <IconCheck className="size-12" />
        </span>
        <h3 ref={heading} tabIndex={-1} className="font-script mt-6 text-6xl text-teal-deep outline-none">
          ¡Solicitud enviada!
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-lg text-muted">
          {d.nombre.split(" ")[0]}, recibimos tu ficha y tu solicitud de <strong className="text-teal-deep">{service.title}</strong> para el{" "}
          <strong className="text-teal-deep">{day?.label}</strong> a las <strong className="text-teal-deep">{d.hora}</strong>. Te contactaremos para confirmarla.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {whatsappHref && (
            <a href={whatsappHref} className="btn btn-primary" target="_blank" rel="noopener">
              <IconPhone className="size-5" /> Avisar por WhatsApp
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={reset}>
            <IconCalendar className="size-5" /> Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  const label = "grid gap-2 text-sm font-semibold text-teal-deep";
  const cur = STEPS[step];

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Solicitud de cita y ficha de registro"
      className="grid overflow-hidden rounded-[2rem] bg-white/90 shadow-2xl shadow-teal-deep/15 ring-1 ring-white lg:grid-cols-[18.5rem_1fr]"
    >
      {/* PANEL LATERAL (escritorio) */}
      <aside className="relative hidden flex-col overflow-hidden bg-gradient-to-b from-teal to-[#0f4a55] p-8 text-white lg:flex">
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-leaf/25 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/isotipo-white.svg" alt="" className="relative size-14" />
        <p className="font-script relative mt-3 text-4xl text-leaf">Tu cita</p>
        <p className="relative text-sm text-white/80">Completa estos 6 pasos. Toma menos de 2 minutos.</p>

        <ol className="relative mt-8 grid gap-1" aria-label="Pasos">
          {STEPS.map((s, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <li key={s.label} aria-current={on ? "step" : undefined} className="relative">
                {i < LAST && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[1.35rem] top-[3.1rem] h-5 w-0.5 rounded-full transition-colors duration-500 ${done ? "bg-leaf" : "bg-white/20"}`}
                  />
                )}
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => go(i)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                    on ? "bg-white/15 ring-1 ring-white/25" : i > step ? "opacity-55" : "hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                      done ? "bg-leaf text-teal-deep" : on ? "scale-110 bg-white text-teal-deep shadow-lg" : "bg-white/15 text-white"
                    }`}
                  >
                    {done ? <IconCheck className="size-4" /> : <s.Icon className="size-[1.1rem]" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold leading-tight">{s.label}</span>
                    <span className="block text-xs text-white/65">{s.hint}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

      </aside>

      <div className="flex min-w-0 flex-col">
        {/* BARRA DE PROGRESO (móvil) */}
        <div className="bg-gradient-to-r from-teal to-teal-deep px-5 py-4 text-white lg:hidden">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="flex items-center gap-2">
              <cur.Icon className="size-5" /> {cur.label}
            </span>
            <span className="text-white/80">
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
            <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-6 sm:p-9">
          <div key={step} className={dir === "next" ? "step-next" : "step-prev"}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-leaf-deep">
              Paso {step + 1} de {STEPS.length}
            </p>
            <h3 ref={heading} tabIndex={-1} className="mt-1 font-display text-2xl font-semibold text-teal-deep outline-none sm:text-3xl">
              {
                [
                  "¿Qué servicio necesitas?",
                  "Elige día y hora",
                  "Cuéntanos de ti",
                  "¿Cuál es el motivo de tu consulta?",
                  "Antecedentes y ubicación",
                  "Revisa y confirma",
                ][step]
              }
            </h3>

            <div className="mt-7">
              {/* 0 · SERVICIO */}
              {step === 0 && (
                <div className="grid gap-7">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {services.filter((s) => s.id !== "personalizado").map((s, i) => (
                      <button
                        type="button"
                        key={s.id}
                        aria-pressed={d.servicio === s.id}
                        onClick={() => set("servicio", s.id)}
                        className="opt group/tile hov flex flex-col justify-start overflow-hidden rounded-3xl border-2 border-teal/15 bg-white text-left"
                      >
                        <span className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden">
                          <Image src={`/photos/${s.photo}.webp`} alt={s.alt} fill sizes="(min-width: 640px) 25vw, 90vw" style={{ objectPosition: s.position }} className="object-cover" />
                          <span className="tick absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-teal text-white shadow-lg">
                            <IconCheck className="size-4" />
                          </span>
                        </span>
                        <span className="block w-full p-5">
                          <span className="flex items-center gap-2 font-display text-xl font-semibold text-teal-deep">
                            {i === 0 ? <IconHeart className="size-5" /> : i === 1 ? <IconPilates className="size-5" /> : <IconClipboard className="size-5" />}
                            {s.title}
                          </span>
                          <span className="mt-1 block text-sm text-muted">{s.lead}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold text-teal-deep">¿Es tu primera vez en TANFIP?</legend>
                    <div className="grid max-w-md grid-cols-2 gap-2 rounded-2xl bg-teal/8 p-1.5">
                      {[
                        ["nuevo", "Sí, soy nuevo/a"],
                        ["paciente", "Ya soy paciente"],
                      ].map(([v, l]) => (
                        <button
                          type="button"
                          key={v}
                          aria-pressed={d.paciente === v}
                          onClick={() => set("paciente", v)}
                          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                            d.paciente === v ? "bg-white text-teal-deep shadow-md" : "text-muted hover:text-teal-deep"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* 1 · FECHA Y HORA */}
              {step === 1 && (
                <div className="grid gap-7">
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-deep">
                      <IconCalendar className="size-5" /> Día
                    </p>
                    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7" role="group" aria-label="Días disponibles">
                      {days.length === 0 && Array.from({ length: 7 }).map((_, i) => <span key={i} className="h-24 animate-pulse rounded-2xl bg-teal/10" />)}
                      {days.map((x) => {
                        const on = d.fecha === x.iso;
                        return (
                          <button
                            type="button"
                            key={x.iso}
                            aria-pressed={on}
                            onClick={() => set("fecha", x.iso)}
                            className={`opt w-full rounded-2xl border-2 py-3 text-center ${
                              on ? "!border-transparent !bg-gradient-to-br from-teal to-teal-deep text-white" : "border-teal/15 bg-white"
                            }`}
                          >
                            <span className="block text-xs font-semibold uppercase opacity-80">{x.wd}</span>
                            <span className="block font-display text-2xl font-semibold leading-tight">{x.num}</span>
                            <span className="block text-xs opacity-80">{x.mon}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {[
                    ["Mañana", MORNING],
                    ["Tarde", AFTERNOON],
                  ].map(([title, list]) => (
                    <div key={title as string}>
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-deep">
                        <IconClock className="size-5" /> {title as string}
                      </p>
                      <div className="flex flex-wrap gap-2.5" role="group" aria-label={title as string}>
                        {(list as string[]).map((h) => {
                          const on = d.hora === h;
                          return (
                            <button
                              type="button"
                              key={h}
                              aria-pressed={on}
                              onClick={() => set("hora", h)}
                              className={`opt min-w-[5.5rem] rounded-full border-2 px-5 py-3 text-sm font-semibold ${
                                on ? "!border-transparent !bg-gradient-to-br from-teal to-teal-deep text-white" : "border-teal/15 bg-white"
                              }`}
                            >
                              {h}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <p
                    className={`flex items-center gap-3 rounded-2xl p-4 text-sm transition-all duration-300 ${
                      d.fecha && d.hora ? "bg-leaf/15 text-teal-deep" : "bg-teal/6 text-muted"
                    }`}
                    aria-live="polite"
                  >
                    <IconCheck className={`size-5 shrink-0 ${d.fecha && d.hora ? "text-leaf-deep" : "opacity-30"}`} />
                    {d.fecha && d.hora ? (
                      <span>
                        <strong>{cap(day?.label ?? d.fecha)}</strong> a las <strong>{d.hora}</strong>. Tania confirmará la disponibilidad contigo.
                      </span>
                    ) : (
                      "Elige un día y una hora. Es una preferencia: Tania confirmará la disponibilidad real."
                    )}
                  </p>
                </div>
              )}

              {/* 2 · DATOS PERSONALES */}
              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-6">
                  <label className={`${label} sm:col-span-4`}>
                    Nombre y apellidos
                    <span className="fieldwrap">
                      <IconUser className="size-5" />
                      <input className="field" value={d.nombre} onChange={(e) => set("nombre", e.target.value)} autoComplete="name" placeholder="Tu nombre completo" required />
                    </span>
                  </label>
                  <label className={`${label} sm:col-span-2`}>
                    Edad
                    <span className="fieldwrap">
                      <IconId className="size-5" />
                      <input
                        className="field"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={110}
                        value={d.edad}
                        onChange={(e) => set("edad", e.target.value)}
                        placeholder="Años"
                        required
                        aria-invalid={d.edad !== "" && !edadOk}
                      />
                    </span>
                  </label>
                  <label className={`${label} sm:col-span-3`}>
                    Número de celular
                    <span className="fieldwrap">
                      <IconPhone className="size-5" />
                      <input
                        className="field"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={d.telefono}
                        onChange={(e) => set("telefono", limpiarTelefonoInput(e.target.value))}
                        placeholder="Ej. 949 809 459"
                        required
                        aria-invalid={d.telefono !== "" && !phoneOk}
                      />
                    </span>
                  </label>
                  <label className={`${label} sm:col-span-3`}>
                    <span>
                      Cédula / DNI <span className="font-normal text-muted">(opcional)</span>
                    </span>
                    <span className="fieldwrap">
                      <IconId className="size-5" />
                      <input
                        className="field"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={20}
                        value={d.dni}
                        onChange={(e) => set("dni", e.target.value.replace(/[^0-9A-Za-z-]/g, ""))}
                        placeholder="Tu número de documento"
                      />
                    </span>
                  </label>
                  <label className={`${label} sm:col-span-3`}>
                    <span>
                      Correo <span className="font-normal text-muted">(opcional)</span>
                    </span>
                    <span className="fieldwrap">
                      <IconMail className="size-5" />
                      <input
                        className="field"
                        type="email"
                        autoComplete="email"
                        value={d.correo}
                        onChange={(e) => set("correo", e.target.value)}
                        placeholder="tucorreo@ejemplo.com"
                        aria-invalid={!emailOk}
                      />
                    </span>
                    {!emailOk && <span className="text-sm font-normal text-red-700">Revisa el formato del correo.</span>}
                  </label>
                  <label className={`${label} sm:col-span-3`}>
                    Fecha de registro
                    <span className="fieldwrap">
                      <IconCalendar className="size-5" />
                      <input className="field !bg-teal/5 text-muted" value={hoy} readOnly aria-readonly="true" />
                    </span>
                  </label>
                  <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={d.web} onChange={(e) => set("web", e.target.value)} />
                </div>
              )}

              {/* 3 · MOTIVO */}
              {step === 3 && (
                <div className="grid gap-8">
                  <fieldset>
                    <legend className="sr-only">Motivo de consulta</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {MOTIVOS.map((m) => (
                        <button
                          type="button"
                          key={m}
                          aria-pressed={d.motivoConsulta === m}
                          onClick={() => set("motivoConsulta", m)}
                          className="opt flex items-center gap-3 rounded-2xl border-2 border-teal/15 bg-white p-4 text-left text-sm font-medium"
                        >
                          <span
                            aria-hidden="true"
                            className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
                              d.motivoConsulta === m ? "border-teal bg-teal text-white" : "border-teal/30 bg-white text-transparent"
                            }`}
                          >
                            <IconCheck className="size-3.5" />
                          </span>
                          {m}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className={label}>
                    <span>
                      ¿Qué patología o diagnóstico tiene? <span className="font-normal text-muted">(si cuenta con uno)</span>
                    </span>
                    <span className="fieldwrap">
                      <IconClipboard className="size-5" />
                      <input className="field" value={d.patologia} onChange={(e) => set("patologia", e.target.value)} placeholder="Ej. hernia discal L4-L5" />
                    </span>
                  </label>

                  <fieldset>
                    <legend className="text-sm font-semibold text-teal-deep">¿Dónde presenta el dolor o molestia?</legend>
                    <p className="mb-4 text-sm text-muted">Toca el muñeco o elige de la lista. Puedes marcar más de una zona.</p>
                    <div className="grid items-center gap-6 sm:grid-cols-[11rem_1fr]">
                      <svg viewBox="0 0 140 300" className="mx-auto h-72 w-auto drop-shadow-sm" role="img" aria-label="Muñeco para marcar las zonas de dolor">
                        <g fill="none" stroke="#cfe6e3" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="70" cy="26" r="17" fill="#cfe6e3" stroke="none" />
                          <path d="M70 43v14" strokeWidth="14" />
                          <path d="M44 66h52" strokeWidth="14" />
                          <rect x="46" y="60" width="48" height="104" rx="22" fill="#cfe6e3" stroke="none" />
                          <path d="M42 68 28 108 22 158 20 178M98 68l14 40 6 50 2 20" strokeWidth="13" />
                          <path d="M56 160l2 56-2 46-2 30M84 160l-2 56 2 46 2 30" strokeWidth="19" />
                        </g>
                        {ZONAS.map((z) => {
                          const on = d.zonas.includes(z.name);
                          return (
                            <g key={z.name} onClick={() => toggleZona(z.name)} className="zone-dot" aria-hidden="true">
                              {z.pts.map(([cx, cy], i) => (
                                <g key={i}>
                                  {on && <circle className="art-pulse" cx={cx} cy={cy} r="8" fill="none" stroke="#8bb93e" strokeWidth="2.5" />}
                                  <circle cx={cx} cy={cy} r={on ? 8 : 6} fill={on ? "#5f9a3a" : "#1b7f8e"} fillOpacity={on ? 0.95 : 0.28} stroke="#fff" strokeWidth="1.5" />
                                </g>
                              ))}
                            </g>
                          );
                        })}
                      </svg>
                      <div className="flex flex-wrap gap-2">
                        {ZONAS.map((z) => (
                          <button
                            type="button"
                            key={z.name}
                            aria-pressed={d.zonas.includes(z.name)}
                            onClick={() => toggleZona(z.name)}
                            className="chip rounded-full border-2 border-teal/15 bg-white px-4 py-2 text-sm font-medium"
                          >
                            {z.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className="mb-3 text-sm font-semibold text-teal-deep">¿Desde cuándo presenta el dolor o molestia?</legend>
                    <div className="grid gap-2 sm:grid-cols-4">
                      {DESDE.map((m) => (
                        <button
                          type="button"
                          key={m}
                          aria-pressed={d.desde === m}
                          onClick={() => set("desde", m)}
                          className="opt rounded-2xl border-2 border-teal/15 bg-white px-3 py-3 text-center text-sm font-medium"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* 4 · ANTECEDENTES */}
              {step === 4 && (
                <div className="grid gap-5">
                  <label className={label}>
                    ¿Tiene antecedentes de alguna enfermedad, lesión o cirugía?
                    <textarea className="field min-h-24" value={d.antecedentes} onChange={(e) => set("antecedentes", e.target.value)} placeholder="Si no tiene, puede dejarlo vacío" />
                  </label>
                  <label className={label}>
                    ¿Actualmente toma algún medicamento?
                    <textarea className="field min-h-20" value={d.medicamentos} onChange={(e) => set("medicamentos", e.target.value)} placeholder="Nombre del medicamento, si aplica" />
                  </label>
                  <label className={label}>
                    Dirección o distrito donde reside
                    <span className="fieldwrap">
                      <IconPin className="size-5" />
                      <input className="field" value={d.direccion} onChange={(e) => set("direccion", e.target.value)} autoComplete="street-address" placeholder="Ej. barrio o distrito" />
                    </span>
                  </label>
                  <label className={label}>
                    <span>
                      Información adicional <span className="font-normal text-muted">(opcional)</span>
                    </span>
                    <textarea className="field min-h-24" value={d.adicional} onChange={(e) => set("adicional", e.target.value)} placeholder="Algo más que Tania deba saber" />
                  </label>
                </div>
              )}

              {/* 5 · CONFIRMAR */}
              {step === 5 && (
                <div className="grid gap-6">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card Icon={IconClipboard} k="Servicio" v={`${service.title} · ${d.paciente === "nuevo" ? "primera vez" : "paciente"}`} />
                    <Card Icon={IconCalendar} k="Fecha y hora" v={`${cap(day?.label ?? d.fecha)} · ${d.hora}`} />
                    <Card Icon={IconUser} k="Paciente" v={`${d.nombre} · ${d.edad} años`} sub={`${formatoTelefono(d.telefono)}${d.correo ? ` · ${d.correo}` : ""}`} />
                    <Card Icon={IconHeart} k="Motivo" v={d.motivoConsulta} sub={[d.patologia, d.desde].filter(Boolean).join(" · ")} />
                    {d.zonas.length > 0 && <Card Icon={IconShield} k="Zonas" v={d.zonas.join(", ")} wide />}
                    {d.antecedentes && <Card Icon={IconClipboard} k="Antecedentes" v={d.antecedentes} wide />}
                    {d.medicamentos && <Card Icon={IconClipboard} k="Medicamentos" v={d.medicamentos} wide />}
                    {d.direccion && <Card Icon={IconPin} k="Residencia" v={d.direccion} />}
                    {d.adicional && <Card Icon={IconClipboard} k="Adicional" v={d.adicional} wide />}
                  </div>
                  <label
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 text-sm transition ${
                      d.consentimiento ? "border-teal bg-white" : "border-dashed border-teal/30 bg-teal/5"
                    } has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-leaf`}
                  >
                    <input type="checkbox" checked={d.consentimiento} onChange={(e) => set("consentimiento", e.target.checked)} className="peer sr-only" />
                    <span
                      className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border-2 transition ${
                        d.consentimiento ? "border-teal bg-teal text-white" : "border-teal/40 bg-white text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <IconCheck className="size-4" />
                    </span>
                    <span className="leading-relaxed text-muted">
                      <IconLock className="mr-1 inline size-4 text-teal" />
                      La información proporcionada será utilizada exclusivamente para fines de registro y atención fisioterapéutica, manteniendo la
                      confidencialidad de mis datos personales y de salud. Acepto la{" "}
                      <Link href="/privacidad" target="_blank" className="font-semibold text-teal-deep underline underline-offset-2">política de privacidad</Link> y los{" "}
                      <Link href="/terminos" target="_blank" className="font-semibold text-teal-deep underline underline-offset-2">términos y condiciones</Link>.
                    </span>
                  </label>
                  {status === "error" && (
                    <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      No pudimos enviar tu solicitud. Intenta de nuevo.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-teal/10 bg-white/90 px-6 py-4 backdrop-blur sm:px-9">
          <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
            <IconArrowLeft /> Atrás
          </button>
          <button type="submit" className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={!valid[step] || status === "sending"}>
            {step < LAST ? (
              <>
                Continuar <IconArrow />
              </>
            ) : status === "sending" ? (
              "Enviando…"
            ) : (
              <>
                <IconCalendar className="size-5" /> Solicitar mi cita
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Card({
  Icon,
  k,
  v,
  sub,
  wide = false,
}: {
  Icon: typeof IconUser;
  k: string;
  v: string;
  sub?: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border border-teal/10 bg-white p-4 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal/10 text-teal-deep">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</p>
        <p className="break-words font-semibold text-ink">{v}</p>
        {sub && <p className="break-words text-sm text-muted">{sub}</p>}
      </div>
    </div>
  );
}
