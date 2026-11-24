// Implementación Supabase de `Db`. Recibe un cliente ya autenticado (sesión del usuario → RLS) o el de servicio.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ConflictError, type Db } from "./types";

type Row = Record<string, unknown>;

const snake = (k: string) => k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
// Campos que en la app son "" cuando faltan y en la base son NULL
const NULLABLE = new Set(["propuestaFecha", "propuestaHora", "consentimientoAt", "pacienteId", "citaId", "pausaInicio", "pausaFin", "servicio"]);
const FICHA = ["motivoConsulta", "patologia", "zonas", "desde", "antecedentes", "medicamentos"] as const;

function toRow(o: object): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    out[snake(k)] = v === "" && NULLABLE.has(k) ? null : v;
  }
  return out;
}
function fromRow<T>(r: Row | null | undefined): T {
  const out: Row = {};
  for (const [k, v] of Object.entries(r ?? {})) {
    if (v === null) out[camel(k)] = k === "edad" ? null : "";
    else if (typeof v === "string" && /^\d{2}:\d{2}:\d{2}$/.test(v)) out[camel(k)] = v.slice(0, 5);
    else out[camel(k)] = v;
  }
  return out as T;
}
const rows = <T,>(d: unknown) => ((d as Row[]) ?? []).map((r) => fromRow<T>(r));

function fail(e: { message: string; code?: string } | null): void {
  if (!e) return;
  if (e.code === "23P01") throw new ConflictError("Ese horario se cruza con otra cita.");
  // No incluir datos del paciente en el error: solo el código.
  throw new Error(`Error de base de datos${e.code ? ` (${e.code})` : ""}`);
}

export function createSupabaseDb(c: SupabaseClient): Db {
  const all = async <T,>(table: string, order?: string, filter?: [string, string]) => {
    let q = c.from(table).select("*");
    if (filter) q = q.eq(filter[0], filter[1]);
    if (order) q = q.order(order);
    const { data, error } = await q;
    fail(error);
    return rows<T>(data);
  };
  const stamp = (input: { id?: string }, actor: string): Row => {
    const base: Row = { actualizadoPor: actor, actualizadoEn: new Date().toISOString() };
    if (!input.id) base.creadoPor = actor;
    return base;
  };
  const upsertAuditado = async <T,>(table: string, input: { id?: string }, actor: string) => {
    const payload = toRow({ ...input, ...stamp(input, actor) });
    const { data, error } = input.id
      ? await c.from(table).update(payload).eq("id", input.id).select().single()
      : await c.from(table).insert(payload).select().single();
    fail(error);
    return fromRow<T>(data as Row);
  };
  const del = async (table: string, id: string, key = "id") => {
    const { error } = await c.from(table).delete().eq(key, id);
    fail(error);
  };

  const joinFicha = (r: Row) => {
    const f = r.fichas_clinicas;
    const ficha = (Array.isArray(f) ? f[0] : f) as Row | null | undefined;
    const { fichas_clinicas: _omit, ...rest } = r;
    void _omit;
    const p = fromRow<Record<string, unknown>>(rest);
    const fc = fromRow<Record<string, unknown>>(ficha ?? {});
    for (const k of FICHA) p[k] = fc[k] ?? (k === "zonas" ? [] : "");
    return p;
  };

  return {
    listServicios: () => all("servicios", "nombre"),
    async saveServicio(s) {
      const { error } = await c.from("servicios").upsert(toRow(s));
      fail(error);
      return s;
    },
    async listHorarios() { return all("horarios", "dia"); },
    async saveHorarios(h) {
      const { error } = await c.from("horarios").upsert(h.map(toRow));
      fail(error);
    },
    listBloqueos: () => all("bloqueos", "desde"),
    async addBloqueo(b) {
      const { data, error } = await c.from("bloqueos").insert(toRow(b)).select().single();
      fail(error);
      return fromRow(data as Row);
    },
    deleteBloqueo: (id) => del("bloqueos", id),

    async listSolicitudes() {
      const { data, error } = await c.from("solicitudes").select("*").order("creada_en", { ascending: false });
      fail(error);
      return rows(data);
    },
    async getSolicitud(id) {
      const { data, error } = await c.from("solicitudes").select("*").eq("id", id).maybeSingle();
      fail(error);
      return data ? fromRow(data as Row) : null;
    },
    async createSolicitud(s) {
      const { data, error } = await c
        .from("solicitudes")
        .insert(toRow({ ...s, consentimientoAt: s.consentimiento ? new Date().toISOString() : "" }))
        .select()
        .single();
      fail(error);
      return fromRow(data as Row);
    },
    async updateSolicitud(id, patch) {
      const { data, error } = await c.from("solicitudes").update(toRow(patch)).eq("id", id).select().single();
      fail(error);
      return fromRow(data as Row);
    },

    async listPacientes() {
      const { data, error } = await c.from("pacientes").select("*, fichas_clinicas(*)").order("nombre");
      fail(error);
      return ((data as Row[]) ?? []).map(joinFicha) as never;
    },
    async getPaciente(id) {
      const { data, error } = await c.from("pacientes").select("*, fichas_clinicas(*)").eq("id", id).maybeSingle();
      fail(error);
      return data ? (joinFicha(data as Row) as never) : null;
    },
    async savePaciente(p, actor) {
      const ficha: Row = {};
      const admin: Row = {};
      for (const [k, v] of Object.entries(p)) (FICHA as readonly string[]).includes(k) ? (ficha[k] = v) : (admin[k] = v);
      const saved = await upsertAuditado<{ id: string }>("pacientes", admin, actor);
      const { error } = await c.from("fichas_clinicas").upsert(toRow({ pacienteId: saved.id, ...ficha }));
      // Recepción no tiene permiso sobre la ficha clínica (RLS): se ignora ese caso concreto.
      if (error && error.code !== "42501") fail(error);
      const { data } = await c.from("pacientes").select("*, fichas_clinicas(*)").eq("id", saved.id).single();
      return joinFicha(data as Row) as never;
    },
    deletePaciente: (id) => del("pacientes", id),

    async listCitas() {
      const { data, error } = await c.from("citas").select("*").order("fecha").order("hora");
      fail(error);
      return rows<Row>(data).map(({ rango: _r, ...rest }) => rest) as never;
    },
    async saveCita(cita, actor) {
      const saved = await upsertAuditado<Row>("citas", cita, actor);
      const { rango: _r, ...rest } = saved;
      void _r;
      return rest as never;
    },
    deleteCita: (id) => del("citas", id),

    async listNotas(pid) {
      let q = c.from("notas_seguimiento").select("*").order("fecha", { ascending: false });
      if (pid) q = q.eq("paciente_id", pid);
      const { data, error } = await q;
      fail(error);
      return rows(data);
    },
    saveNota: (n, actor) => upsertAuditado("notas_seguimiento", n, actor),
    deleteNota: (id) => del("notas_seguimiento", id),
    async listPlanes(pid) {
      let q = c.from("plan_tratamiento").select("*").order("inicio", { ascending: false });
      if (pid) q = q.eq("paciente_id", pid);
      const { data, error } = await q;
      fail(error);
      return rows(data);
    },
    savePlan: (p, actor) => upsertAuditado("plan_tratamiento", p, actor),
    deletePlan: (id) => del("plan_tratamiento", id),

    // Los archivos de pacientes se guardan solo con Neon o en modo local.
    listArchivos: async () => [],
    saveArchivo: async () => { throw new Error("Archivos no disponibles con Supabase"); },
    getArchivo: async () => null,
    deleteArchivo: async () => {},
    async getSettings() {
      const { data, error } = await c.from("site_settings").select("clave, valor");
      fail(error);
      return Object.fromEntries(((data as { clave: string; valor: unknown }[]) ?? []).map((r) => [r.clave, r.valor]));
    },
    async saveSettings(s, actor) {
      const filas = Object.entries(s).map(([clave, valor]) => ({ clave, valor, actualizado_por: actor, actualizado_en: new Date().toISOString() }));
      if (!filas.length) return;
      const { error } = await c.from("site_settings").upsert(filas);
      fail(error);
    },
    async audit(actor, accion, entidad, entidadId = "") {
      await c.from("audit_log").insert({ actor, accion, entidad, entidad_id: entidadId });
    },
  };
}
