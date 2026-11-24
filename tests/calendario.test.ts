import { describe, expect, it } from "vitest";
import { memoryDb } from "@/lib/db/memory";
import { addDays, todayISO } from "@/lib/db/dates";
import { calendarioIcs, recordatoriosDeManana } from "@/lib/reminders";

describe("calendario .ics", () => {
  it("genera un calendario válido con eventos y zona horaria", async () => {
    const ics = await calendarioIcs(memoryDb, "America/Lima");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
    expect(ics).toMatch(/DTSTART;TZID=America\/Lima:\d{8}T\d{6}/);
    const abre = ics.split("BEGIN:VEVENT").length - 1;
    expect(abre).toBe(ics.split("END:VEVENT").length - 1);
    expect(abre).toBeGreaterThan(0);
  });
  it("no incluye citas canceladas", async () => {
    const [p] = await memoryDb.listPacientes();
    const c = await memoryDb.saveCita({ pacienteId: p.id, servicio: "fisioterapia", fecha: addDays(todayISO(), 20), hora: "15:00", duracionMin: 60, estado: "cancelada", notas: "" }, "test");
    expect(await calendarioIcs(memoryDb, "America/Lima")).not.toContain(`UID:${c.id}@tanfip`);
  });
});

describe("recordatorios", () => {
  it("solo incluye citas activas de mañana, ordenadas por hora", async () => {
    const [p] = await memoryDb.listPacientes();
    const f = addDays(todayISO(), 1);
    const mk = (hora: string, estado: "confirmada" | "cancelada") =>
      memoryDb.saveCita({ pacienteId: p.id, servicio: "pilates", fecha: f, hora, duracionMin: 30, estado, notas: "" }, "test");
    await mk("19:00", "confirmada").catch(() => null);
    await mk("19:30", "cancelada");
    const lista = await recordatoriosDeManana(memoryDb);
    expect(lista.every((r) => r.cita.fecha === f && r.cita.estado !== "cancelada")).toBe(true);
    expect([...lista].map((r) => r.cita.hora)).toEqual([...lista.map((r) => r.cita.hora)].sort());
    expect(lista.every((r) => r.texto.includes(r.cita.hora))).toBe(true);
  });
});
