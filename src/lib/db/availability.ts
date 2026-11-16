// Lógica pura de disponibilidad y solapes (la usan la API pública, el admin y las acciones).
import type { Bloqueo, Cita, Horario, Servicio, Solicitud } from "./types";
import { fromMin, toMin, weekday } from "./dates";

export const ESTADOS_QUE_OCUPAN = ["pendiente", "confirmada", "atendida"] as const;
const ocupa = (c: Pick<Cita, "estado">) => (ESTADOS_QUE_OCUPAN as readonly string[]).includes(c.estado);

export const solapa = (aIni: number, aDur: number, bIni: number, bDur: number) => aIni < bIni + bDur && bIni < aIni + aDur;

/** Devuelve la cita con la que choca (o null). Una sola profesional: cualquier cita activa ocupa el hueco. */
export function buscarChoque(
  citas: Cita[],
  q: { fecha: string; hora: string; duracionMin: number; excluirId?: string },
): Cita | null {
  const ini = toMin(q.hora);
  return (
    citas.find(
      (c) => c.id !== q.excluirId && c.fecha === q.fecha && ocupa(c) && solapa(ini, q.duracionMin, toMin(c.hora), c.duracionMin),
    ) ?? null
  );
}

export const estaBloqueado = (bloqueos: Bloqueo[], fecha: string) => bloqueos.find((b) => fecha >= b.desde && fecha <= b.hasta) ?? null;

export type EntradaDisponibilidad = {
  fecha: string;
  servicio: Servicio;
  horarios: Horario[];
  bloqueos: Bloqueo[];
  citas: Cita[];
  solicitudes: Solicitud[]; // las "nueva" reservan hueco provisional
  servicios: Servicio[]; // para conocer la duración de las solicitudes
  hoy: string;
  ahoraMin: number;
  paso?: number; // minutos entre horas ofrecidas
  excluirCitaId?: string;
};

export function horasLibres(e: EntradaDisponibilidad): string[] {
  if (e.fecha < e.hoy || !e.servicio.activo) return [];
  if (estaBloqueado(e.bloqueos, e.fecha)) return [];
  const h = e.horarios.find((x) => x.dia === weekday(e.fecha));
  if (!h || !h.activo) return [];
  const paso = e.paso ?? 30;
  const dur = e.servicio.duracionMin;
  const fin = toMin(h.fin);
  const pIni = h.pausaInicio ? toMin(h.pausaInicio) : -1;
  const pFin = h.pausaFin ? toMin(h.pausaFin) : -1;

  const ocupadas: { ini: number; dur: number }[] = [
    ...e.citas.filter((c) => c.fecha === e.fecha && ocupa(c) && c.id !== e.excluirCitaId).map((c) => ({ ini: toMin(c.hora), dur: c.duracionMin })),
    ...e.solicitudes
      .filter((s) => s.estado === "nueva" && s.fecha === e.fecha)
      .map((s) => ({ ini: toMin(s.hora), dur: e.servicios.find((x) => x.id === s.servicio)?.duracionMin ?? 60 })),
  ];

  const out: string[] = [];
  for (let t = toMin(h.inicio); t + dur <= fin; t += paso) {
    if (e.fecha === e.hoy && t <= e.ahoraMin) continue;
    if (pIni >= 0 && pFin > pIni && solapa(t, dur, pIni, pFin - pIni)) continue;
    if (ocupadas.some((o) => solapa(t, dur, o.ini, o.dur))) continue;
    out.push(fromMin(t));
  }
  return out;
}
