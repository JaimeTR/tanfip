import type { Paciente } from "@/lib/db/types";

/** Quita la ficha clínica de un paciente (para el rol recepción). */
export const sinFicha = (p: Paciente): Paciente => ({ ...p, motivoConsulta: "", patologia: "", zonas: [], desde: "", antecedentes: "", medicamentos: "" });
