import { describe, expect, it } from "vitest";
import { buscarChoque, horasLibres } from "@/lib/db/availability";
import type { Bloqueo, Cita, Horario, Servicio } from "@/lib/db/types";

const servicio: Servicio = { id: "fisioterapia", nombre: "Fisioterapia", descripcion: "", duracionMin: 60, activo: true };
// 2030-01-07 es lunes
const FECHA = "2030-01-07";
const horario = (o: Partial<Horario> = {}): Horario => ({ dia: 1, activo: true, inicio: "09:00", fin: "13:00", pausaInicio: "", pausaFin: "", ...o });
const cita = (o: Partial<Cita>): Cita => ({
  id: "c1", pacienteId: "p1", servicio: "fisioterapia", fecha: FECHA, hora: "09:00", duracionMin: 60, estado: "confirmada", notas: "",
  creadoEn: "", creadoPor: "", actualizadoEn: "", actualizadoPor: "", ...o,
});
const base = { fecha: FECHA, servicio, horarios: [horario()], bloqueos: [] as Bloqueo[], citas: [] as Cita[], solicitudes: [], servicios: [servicio], hoy: "2030-01-01", ahoraMin: 0 };

describe("horasLibres", () => {
  it("ofrece horas cada 30 min dentro del horario", () => {
    expect(horasLibres(base)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]);
  });
  it("quita las horas que chocan con una cita", () => {
    const h = horasLibres({ ...base, citas: [cita({ hora: "10:00" })] });
    expect(h).not.toContain("09:30");
    expect(h).not.toContain("10:00");
    expect(h).not.toContain("10:30");
    expect(h).toContain("09:00");
    expect(h).toContain("11:00");
  });
  it("ignora citas canceladas", () => {
    expect(horasLibres({ ...base, citas: [cita({ estado: "cancelada" })] })).toContain("09:00");
  });
  it("respeta la pausa", () => {
    const h = horasLibres({ ...base, horarios: [horario({ pausaInicio: "11:00", pausaFin: "12:00" })] });
    expect(h).not.toContain("11:00");
    expect(h).not.toContain("10:30");
    expect(h).toContain("12:00");
  });
  it("devuelve vacío en día bloqueado, día inactivo o fecha pasada", () => {
    expect(horasLibres({ ...base, bloqueos: [{ id: "b", desde: FECHA, hasta: FECHA, motivo: "" }] })).toEqual([]);
    expect(horasLibres({ ...base, horarios: [horario({ activo: false })] })).toEqual([]);
    expect(horasLibres({ ...base, hoy: "2030-02-01" })).toEqual([]);
  });
  it("hoy no ofrece horas que ya pasaron", () => {
    const h = horasLibres({ ...base, hoy: FECHA, ahoraMin: 10 * 60 });
    expect(h[0]).toBe("10:30");
  });
});

describe("buscarChoque", () => {
  const citas = [cita({ hora: "10:00" })];
  it("detecta solape parcial", () => expect(buscarChoque(citas, { fecha: FECHA, hora: "10:30", duracionMin: 60 })?.id).toBe("c1"));
  it("permite citas contiguas", () => expect(buscarChoque(citas, { fecha: FECHA, hora: "11:00", duracionMin: 60 })).toBeNull());
  it("excluye la propia cita al editar", () => expect(buscarChoque(citas, { fecha: FECHA, hora: "10:00", duracionMin: 60, excluirId: "c1" })).toBeNull());
});
