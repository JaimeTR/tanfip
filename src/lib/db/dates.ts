// Utilidades de fecha/hora en la zona horaria de la consulta (sin depender de la zona del servidor).
// Solo llamar desde código que corre en tiempo de petición (no durante el prerender).

export const CLINIC_TZ = process.env.CLINIC_TZ || "America/Guayaquil";

export function nowParts(): { fecha: string; minutos: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { fecha: `${g("year")}-${g("month")}-${g("day")}`, minutos: Number(g("hour")) * 60 + Number(g("minute")) };
}

export const todayISO = () => nowParts().fecha;

export const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T00:00:00Z"));
export const isHHMM = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** 0 = domingo … 6 = sábado */
export const weekday = (iso: string) => new Date(iso + "T00:00:00Z").getUTCDay();
/** Lunes de la semana de `iso` */
export const startOfWeek = (iso: string) => addDays(iso, -((weekday(iso) + 6) % 7));
export const monthStart = (iso: string) => iso.slice(0, 8) + "01";

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es", { timeZone: "UTC", ...opts });
export const fmtLong = (iso: string) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date(iso + "T00:00:00Z"));
export const fmtShort = (iso: string) => fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(iso + "T00:00:00Z")).replace(/\./g, "");
export const fmtDay = (iso: string) => fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso + "T00:00:00Z")).replace(/\./g, "");
export const fmtDateTime = (isoTs: string) =>
  isoTs ? new Intl.DateTimeFormat("es", { timeZone: CLINIC_TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(isoTs)).replace(/\./g, "") : "";
