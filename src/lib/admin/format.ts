// Utilidades de presentación seguras para cliente y servidor.
const CODIGO_PAIS = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || "593";

/** Teléfono → solo dígitos con código de país (0991234567 → 593991234567). */
export function telefonoWa(tel: string): string {
  let d = tel.replace(/\D/g, "");
  if (tel.trim().startsWith("+")) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.startsWith(CODIGO_PAIS) ? d : CODIGO_PAIS + d;
}

export const waLink = (tel: string, texto: string) => `https://wa.me/${telefonoWa(tel)}?text=${encodeURIComponent(texto)}`;

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es", { timeZone: "UTC", ...o });
export const diaLargo = (iso: string) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date(iso + "T00:00:00Z"));
export const diaCorto = (iso: string) => fmt({ weekday: "short", day: "numeric", month: "short" }).format(new Date(iso + "T00:00:00Z")).replace(/\./g, "");
export const diaNum = (iso: string) => fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(iso + "T00:00:00Z")).replace(/\./g, "");
export const mesAnio = (iso: string) => fmt({ month: "long", year: "numeric" }).format(new Date(iso + "T00:00:00Z"));
export const fechaHora = (ts: string) =>
  ts ? new Intl.DateTimeFormat("es", { timeZone: "America/Guayaquil", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts)).replace(/\./g, "") : "—";
export const soloFecha = (ts: string) => (ts ? new Intl.DateTimeFormat("es", { timeZone: "America/Guayaquil", day: "numeric", month: "short", year: "numeric" }).format(new Date(ts)).replace(/\./g, "") : "—");

export function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const diaSemana = (iso: string) => new Date(iso + "T00:00:00Z").getUTCDay();
export const lunesDe = (iso: string) => addDays(iso, -((diaSemana(iso) + 6) % 7));
export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const sumaMin = (hhmm: string, min: number) => {
  const t = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5)) + min;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

export const iniciales = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

/** Color de la escala EVA 0–10 (verde → rojo). */
export const colorEva = (n: number) => (n <= 2 ? "#5f9a3a" : n <= 4 ? "#8bb93e" : n <= 6 ? "#d9a300" : n <= 8 ? "#e07a1f" : "#c0392b");

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
