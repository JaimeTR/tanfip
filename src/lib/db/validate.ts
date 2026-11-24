// Validación y saneamiento en el servidor de todo lo que llega desde el navegador o la landing.
import { isHHMM, isISODate } from "./dates";
import { METODOS_PAGO } from "./types";
import type { CitaInput, EstadoCita, EstadoPaciente, EstadoPlan, Horario, NotaInput, NuevaSolicitud, PacienteInput, PlanInput, Servicio, SiteSettings } from "./types";

export class ValidationError extends Error {}
const bad = (m: string): never => {
  throw new ValidationError(m);
};

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : bad("Datos inválidos"));
// elimina caracteres de control (salvo salto de línea y tabulación)
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;
export const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(CONTROL, "").trim().slice(0, max) : "");
const req = (v: unknown, max: number, msg: string) => str(v, max) || bad(msg);
const oneOf = <T extends string>(v: unknown, opts: readonly T[], msg: string): T => (opts.includes(v as T) ? (v as T) : bad(msg));
const fecha = (v: unknown, msg = "Fecha inválida") => (typeof v === "string" && isISODate(v) ? v : bad(msg));
const hora = (v: unknown, msg = "Hora inválida") => (typeof v === "string" && isHHMM(v) ? v : bad(msg));
const int = (v: unknown, min: number, max: number, msg: string) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : bad(msg);
};
const id = (v: unknown) => (typeof v === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : "");
const idReq = (v: unknown, msg: string) => id(v) || bad(msg);
const strList = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, n).map((x) => str(x, max)) : []);

export const ZONAS = ["Cuello", "Hombro", "Brazo / Codo", "Muñeca / Mano", "Espalda alta", "Espalda baja / Lumbar", "Cadera", "Muslo / Rodilla", "Pierna / Tobillo", "Pie"] as const;
const zonas = (v: unknown) => strList(v, 12, 40).filter((z) => (ZONAS as readonly string[]).includes(z));

export const ESTADOS_CITA: readonly EstadoCita[] = ["pendiente", "confirmada", "atendida", "cancelada", "no_asistio"];
export const ESTADOS_PACIENTE: readonly EstadoPaciente[] = ["activo", "alta", "inactivo"];
export const ESTADOS_PLAN: readonly EstadoPlan[] = ["activo", "completado", "pausado"];

export const parseId = (v: unknown) => idReq(v, "Registro no encontrado");
export const parseFecha = (v: unknown) => fecha(v);
export const parseHora = (v: unknown) => hora(v);
export const parseEstadoCita = (v: unknown) => oneOf(v, ESTADOS_CITA, "Estado inválido");

export function parseSolicitudPublica(raw: unknown): NuevaSolicitud {
  const b = obj(raw);
  const edad = Number(b.edad);
  const telefono = str(b.telefono, 30);
  if (telefono.replace(/\D/g, "").length < 7) bad("Teléfono inválido");
  if (b.consentimiento !== true) bad("Falta el consentimiento");
  const nombre = str(b.nombre, 120);
  return {
    servicio: req(b.servicio, 40, "Falta el servicio"),
    paciente: b.paciente === "paciente" ? "paciente" : "nuevo",
    fecha: fecha(b.fecha),
    hora: hora(b.hora),
    nombre: nombre.length >= 3 ? nombre : bad("Nombre inválido"),
    dni: str(b.dni, 20).replace(/[^0-9A-Za-z-]/g, ""),
    edad: Number.isInteger(edad) && edad >= 1 && edad <= 110 ? edad : bad("Edad inválida"),
    telefono,
    correo: str(b.correo, 160),
    motivoConsulta: req(b.motivoConsulta, 80, "Falta el motivo de consulta"),
    patologia: str(b.patologia, 200),
    zonas: zonas(b.zonas),
    desde: str(b.desde, 40),
    antecedentes: str(b.antecedentes, 1000),
    medicamentos: str(b.medicamentos, 500),
    direccion: str(b.direccion, 200),
    adicional: str(b.adicional, 1000),
    consentimiento: true,
  };
}

export function parsePaciente(raw: unknown): PacienteInput {
  const b = obj(raw);
  const edad = b.edad === "" || b.edad == null ? null : int(b.edad, 0, 120, "Edad inválida");
  const consentimiento = b.consentimiento === true;
  const nombre = str(b.nombre, 120);
  return {
    id: id(b.id) || undefined,
    nombre: nombre.length >= 3 ? nombre : bad("Escribe el nombre completo"),
    edad,
    telefono: str(b.telefono, 30),
    correo: str(b.correo, 160),
    direccion: str(b.direccion, 200),
    servicio: str(b.servicio, 40),
    estado: oneOf(b.estado ?? "activo", ESTADOS_PACIENTE, "Estado inválido"),
    motivoConsulta: str(b.motivoConsulta, 80),
    patologia: str(b.patologia, 200),
    zonas: zonas(b.zonas),
    desde: str(b.desde, 40),
    antecedentes: str(b.antecedentes, 1000),
    medicamentos: str(b.medicamentos, 500),
    consentimiento,
    consentimientoAt: consentimiento ? str(b.consentimientoAt, 40) || new Date().toISOString() : "",
  };
}

export function parseCita(raw: unknown): CitaInput {
  const b = obj(raw);
  return {
    id: id(b.id) || undefined,
    pacienteId: idReq(b.pacienteId, "Elige un paciente"),
    servicio: req(b.servicio, 40, "Elige un servicio"),
    fecha: fecha(b.fecha, "Elige una fecha"),
    hora: hora(b.hora, "Elige una hora"),
    duracionMin: int(b.duracionMin, 10, 480, "Duración inválida"),
    estado: oneOf(b.estado ?? "pendiente", ESTADOS_CITA, "Estado inválido"),
    notas: str(b.notas, 500),
  };
}

export function parseNota(raw: unknown): NotaInput {
  const b = obj(raw);
  return {
    id: id(b.id) || undefined,
    pacienteId: idReq(b.pacienteId, "Paciente no encontrado"),
    citaId: id(b.citaId),
    fecha: fecha(b.fecha, "Elige la fecha de la sesión"),
    eva: int(b.eva, 0, 10, "El dolor (EVA) va de 0 a 10"),
    subjetivo: str(b.subjetivo, 2000),
    objetivo: str(b.objetivo, 2000),
    tratamiento: str(b.tratamiento, 2000),
    observaciones: str(b.observaciones, 2000),
    proximaIndicacion: str(b.proximaIndicacion, 1000),
    fijada: b.fijada === true,
  };
}

export function parsePlan(raw: unknown): PlanInput {
  const b = obj(raw);
  const totales = int(b.sesionesTotales, 0, 500, "Sesiones totales inválidas");
  const hechas = int(b.sesionesHechas, 0, 500, "Sesiones realizadas inválidas");
  return {
    id: id(b.id) || undefined,
    pacienteId: idReq(b.pacienteId, "Paciente no encontrado"),
    titulo: req(b.titulo, 120, "Ponle un título al plan"),
    objetivo: str(b.objetivo, 500),
    frecuencia: str(b.frecuencia, 80),
    sesionesTotales: totales,
    sesionesHechas: hechas,
    inicio: fecha(b.inicio, "Fecha de inicio inválida"),
    estado: oneOf(b.estado ?? "activo", ESTADOS_PLAN, "Estado inválido"),
    notas: str(b.notas, 1000),
  };
}

export function parseServicio(raw: unknown): Servicio {
  const b = obj(raw);
  const sid = str(b.id, 40);
  if (!/^[a-z0-9_-]{2,40}$/.test(sid)) bad("Identificador inválido (minúsculas, números o guiones)");
  return {
    id: sid,
    nombre: req(b.nombre, 80, "Falta el nombre"),
    descripcion: str(b.descripcion, 300),
    duracionMin: int(b.duracionMin, 10, 480, "La duración va de 10 a 480 minutos"),
    activo: b.activo !== false,
  };
}

export function parseHorarios(raw: unknown): Horario[] {
  if (!Array.isArray(raw) || raw.length !== 7) bad("Horario inválido");
  return (raw as unknown[]).map((r) => {
    const b = obj(r);
    const h: Horario = {
      dia: int(b.dia, 0, 6, "Día inválido"),
      activo: b.activo === true,
      inicio: hora(b.inicio, "Hora de inicio inválida"),
      fin: hora(b.fin, "Hora de fin inválida"),
      pausaInicio: b.pausaInicio ? hora(b.pausaInicio, "Pausa inválida") : "",
      pausaFin: b.pausaFin ? hora(b.pausaFin, "Pausa inválida") : "",
    };
    if (h.activo && h.fin <= h.inicio) bad("La hora de fin debe ser posterior al inicio");
    if (!!h.pausaInicio !== !!h.pausaFin || (h.pausaInicio && h.pausaFin <= h.pausaInicio)) bad("Revisa la pausa del almuerzo");
    return h;
  });
}

export function parsePago(raw: unknown) {
  const o = obj(raw);
  const monto = Math.round(Number(o.monto) * 100) / 100;
  if (!Number.isFinite(monto) || monto <= 0 || monto > 100000) bad("El monto debe ser mayor a 0");
  return {
    id: id(o.id) || undefined,
    pacienteId: idReq(o.pacienteId, "Elige un paciente"),
    citaId: id(o.citaId),
    monto,
    metodo: oneOf(o.metodo, METODOS_PAGO, "Elige el método de pago"),
    fecha: fecha(o.fecha),
    concepto: str(o.concepto, 160),
  };
}

export function parseBloqueo(raw: unknown) {
  const b = obj(raw);
  const desde = fecha(b.desde, "Fecha de inicio inválida");
  const hasta = fecha(b.hasta, "Fecha de fin inválida");
  if (hasta < desde) bad("La fecha final no puede ser anterior a la inicial");
  return { desde, hasta, motivo: str(b.motivo, 120) };
}

export function parseSettings(raw: unknown): Partial<SiteSettings> {
  const b = obj(raw);
  const faqs = Array.isArray(b.faqs)
    ? (b.faqs as unknown[]).slice(0, 20).map((f) => ({ q: str(obj(f).q, 200), a: str(obj(f).a, 1000) })).filter((f) => f.q && f.a)
    : [];
  return {
    heroTitulo: str(b.heroTitulo, 120),
    heroDescripcion: str(b.heroDescripcion, 400),
    whatsapp: str(b.whatsapp, 20).replace(/\D/g, ""),
    correo: str(b.correo, 160),
    direccion: str(b.direccion, 200),
    horarios: str(b.horarios, 200),
    instagram: str(b.instagram, 80).replace(/^@/, ""),
    faqs,
  };
}
