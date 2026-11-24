// Recordatorios de citas y feed de calendario. Nunca incluye datos clínicos: solo nombre, servicio, fecha y hora.
import "server-only";
import { addDays, todayISO } from "@/lib/db/dates";
import type { Cita, Db, Paciente } from "@/lib/db/types";
import { diaLargo } from "@/lib/admin/format";

export type Recordatorio = { cita: Cita; paciente: Paciente; servicio: string; texto: string };

export const textoRecordatorio = (nombre: string, servicio: string, fecha: string, hora: string) =>
  `Hola ${nombre}, te recordamos tu cita de ${servicio} el ${diaLargo(fecha)} a las ${hora}. Responde este mensaje para confirmar o si necesitas cambiarla.\n\nTania Castro · TANFIP`;

/** Citas pendientes/confirmadas de mañana, con su paciente. */
export async function recordatoriosDeManana(db: Db): Promise<Recordatorio[]> {
  const fecha = addDays(todayISO(), 1);
  const [citas, pacientes, servicios] = await Promise.all([db.listCitas(), db.listPacientes(), db.listServicios()]);
  const pac = new Map(pacientes.map((p) => [p.id, p]));
  const srv = new Map(servicios.map((s) => [s.id, s.nombre]));
  return citas
    .filter((c) => c.fecha === fecha && (c.estado === "confirmada" || c.estado === "pendiente"))
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .flatMap((cita) => {
      const paciente = pac.get(cita.pacienteId);
      if (!paciente) return [];
      const servicio = srv.get(cita.servicio) ?? cita.servicio;
      return [{ cita, paciente, servicio, texto: textoRecordatorio(paciente.nombre.split(" ")[0], servicio, cita.fecha, cita.hora) }];
    });
}

const esc = (s: string) => s.replace(/([\\;,])/g, "\\$1").replace(/\r?\n/g, "\\n");
const dt = (f: string, h: string) => f.replaceAll("-", "") + "T" + h.replace(":", "") + "00";
const addMin = (f: string, h: string, min: number) => {
  const t = new Date(`${f}T${h}:00Z`);
  t.setUTCMinutes(t.getUTCMinutes() + min);
  const iso = t.toISOString();
  return dt(iso.slice(0, 10), iso.slice(11, 16));
};

/** Calendario .ics (citas no canceladas desde hace 30 días). */
export async function calendarioIcs(db: Db, tz: string): Promise<string> {
  const [citas, pacientes, servicios] = await Promise.all([db.listCitas(), db.listPacientes(), db.listServicios()]);
  const pac = new Map(pacientes.map((p) => [p.id, p.nombre]));
  const srv = new Map(servicios.map((s) => [s.id, s.nombre]));
  const desde = addDays(todayISO(), -30);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const eventos = citas
    .filter((c) => c.fecha >= desde && c.estado !== "cancelada")
    .map((c) =>
      [
        "BEGIN:VEVENT",
        `UID:${c.id}@tanfip`,
        `DTSTAMP:${stamp}`,
        `DTSTART;TZID=${tz}:${dt(c.fecha, c.hora)}`,
        `DTEND;TZID=${tz}:${addMin(c.fecha, c.hora, c.duracionMin || 60)}`,
        `SUMMARY:${esc(`${pac.get(c.pacienteId) ?? "Paciente"} · ${srv.get(c.servicio) ?? c.servicio}`)}`,
        `STATUS:${c.estado === "pendiente" ? "TENTATIVE" : "CONFIRMED"}`,
        "BEGIN:VALARM",
        "TRIGGER:-PT1H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Cita en 1 hora",
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n"),
    );
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TANFIP//Citas//ES",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:TANFIP · Citas",
    `X-WR-TIMEZONE:${tz}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    ...eventos,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
