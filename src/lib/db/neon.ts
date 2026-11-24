// Implementación Neon (Postgres) de `Db`. Se conecta con DATABASE_URL por HTTP (sirve en Vercel sin pool).
// No hay RLS: toda autorización se hace en el servidor (acciones y rutas) antes de llegar aquí.
import "server-only";
import { neon } from "@neondatabase/serverless";
import { ConflictError, type Archivo, type Db, type Usuario } from "./types";

type Row = Record<string, unknown>;

const snake = (k: string) => k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
const camel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
// Campos que en la app son "" cuando faltan y en la base son NULL
const NULLABLE = new Set(["propuestaFecha", "propuestaHora", "consentimientoAt", "pacienteId", "citaId", "pausaInicio", "pausaFin", "servicio"]);
const FICHA = ["motivoConsulta", "patologia", "zonas", "desde", "antecedentes", "medicamentos"] as const;

// Columnas permitidas por tabla: los nombres de columna nunca vienen de texto libre.
const AUDIT = ["creado_en", "creado_por", "actualizado_en", "actualizado_por"];
const COLS = {
  servicios: ["id", "nombre", "descripcion", "duracion_min", "activo"],
  horarios: ["dia", "activo", "inicio", "fin", "pausa_inicio", "pausa_fin"],
  bloqueos: ["id", "desde", "hasta", "motivo"],
  solicitudes: [
    "id", "creada_en", "estado", "servicio", "paciente", "fecha", "hora", "nombre", "dni", "edad", "telefono", "correo", "motivo_consulta",
    "patologia", "zonas", "desde", "antecedentes", "medicamentos", "direccion", "adicional", "consentimiento", "consentimiento_at",
    "propuesta_fecha", "propuesta_hora", "motivo_rechazo", "paciente_id", "cita_id",
  ],
  pacientes: ["id", "nombre", "dni", "edad", "telefono", "correo", "direccion", "servicio", "estado", "consentimiento", "consentimiento_at", ...AUDIT],
  fichas_clinicas: ["paciente_id", "motivo_consulta", "patologia", "zonas", "desde", "antecedentes", "medicamentos"],
  citas: ["id", "paciente_id", "servicio", "fecha", "hora", "duracion_min", "estado", "notas", ...AUDIT],
  notas_seguimiento: [
    "id", "paciente_id", "cita_id", "fecha", "eva", "subjetivo", "objetivo", "tratamiento", "observaciones", "proxima_indicacion", "fijada", ...AUDIT,
  ],
  plan_tratamiento: [
    "id", "paciente_id", "titulo", "objetivo", "frecuencia", "sesiones_totales", "sesiones_hechas", "inicio", "estado", "notas", ...AUDIT,
  ],
} as const;
type Tabla = keyof typeof COLS;

function fromRow<T>(r: Row | null | undefined): T {
  const out: Row = {};
  for (const [k, v] of Object.entries(r ?? {})) {
    if (v === null) out[camel(k)] = k === "edad" ? null : "";
    else if (typeof v === "string" && /^\d{2}:\d{2}:\d{2}$/.test(v)) out[camel(k)] = v.slice(0, 5);
    else out[camel(k)] = v;
  }
  return out as T;
}

/** Objeto de la app → columnas/valores de la tabla (solo las permitidas). */
function toCols(tabla: Tabla, o: object): { cols: string[]; vals: unknown[] } {
  const permitidas = COLS[tabla] as readonly string[];
  const cols: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    const col = snake(k);
    if (!permitidas.includes(col)) continue;
    cols.push(col);
    vals.push(v === "" && NULLABLE.has(k) ? null : v);
  }
  return { cols, vals };
}

function fallo(e: unknown): never {
  const code = (e as { code?: string })?.code;
  if (code === "23P01") throw new ConflictError("Ese horario se cruza con otra cita.");
  // No incluir datos del paciente en el error: solo el código.
  throw new Error(`Error de base de datos${code ? ` (${code})` : ""}`);
}

export function createNeonDb(url: string): Db {
  const sql = neon(url);

  // Todas las lecturas devuelven filas como JSON: fechas y horas llegan como texto (igual que con Supabase).
  const run = async (text: string, params: unknown[] = []): Promise<Row[]> => {
    try {
      return (await sql.query(text, params)) as Row[];
    } catch (e) {
      return fallo(e);
    }
  };
  const lista = async <T,>(select: string, params: unknown[] = []) =>
    (await run(`select to_jsonb(t) as r from (${select}) t`, params)).map((x) => fromRow<T>(x.r as Row));
  const una = async <T,>(select: string, params: unknown[] = []) => (await lista<T>(select, params))[0] ?? null;

  const insertar = async <T,>(tabla: Tabla, o: object): Promise<T> => {
    const { cols, vals } = toCols(tabla, o);
    const filas = await run(
      `insert into public.${tabla} as t (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) returning to_jsonb(t) as r`,
      vals
    );
    return fromRow<T>(filas[0]?.r as Row);
  };
  const actualizar = async <T,>(tabla: Tabla, id: string, o: object, key = "id"): Promise<T> => {
    const { cols, vals } = toCols(tabla, o);
    const campos = cols.map((c, i) => ({ c, v: vals[i] })).filter((x) => x.c !== key);
    const filas = await run(
      `update public.${tabla} as t set ${campos.map((x, i) => `${x.c} = $${i + 1}`).join(", ")} where ${key} = $${campos.length + 1} returning to_jsonb(t) as r`,
      [...campos.map((x) => x.v), id]
    );
    return fromRow<T>(filas[0]?.r as Row);
  };
  const upsert = async (tabla: Tabla, o: object, conflicto: string) => {
    const { cols, vals } = toCols(tabla, o);
    const sets = cols.filter((c) => c !== conflicto).map((c) => `${c} = excluded.${c}`);
    await run(
      `insert into public.${tabla} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")}) on conflict (${conflicto}) do ${
        sets.length ? `update set ${sets.join(", ")}` : "nothing"
      }`,
      vals
    );
  };
  const borrar = async (tabla: Tabla, id: string, key = "id") => {
    await run(`delete from public.${tabla} where ${key} = $1`, [id]);
  };

  const stamp = (input: { id?: string }, actor: string): Row => {
    const base: Row = { actualizadoPor: actor, actualizadoEn: new Date().toISOString() };
    if (!input.id) base.creadoPor = actor;
    return base;
  };
  const guardarAuditado = async <T,>(tabla: Tabla, input: { id?: string }, actor: string): Promise<T> => {
    const payload = { ...input, ...stamp(input, actor) };
    return input.id ? actualizar<T>(tabla, input.id, payload) : insertar<T>(tabla, payload);
  };

  const conFicha = (r: Row, f: Row | null): never => {
    const p = fromRow<Record<string, unknown>>(r);
    const fc = fromRow<Record<string, unknown>>(f ?? {});
    for (const k of FICHA) p[k] = fc[k] ?? (k === "zonas" ? [] : "");
    return p as never;
  };
  const pacientesConFicha = async (donde = "", params: unknown[] = []) => {
    const filas = await run(
      `select to_jsonb(p) as r, to_jsonb(f) as f from public.pacientes p left join public.fichas_clinicas f on f.paciente_id = p.id ${donde} order by p.nombre`,
      params
    );
    return filas.map((x) => conFicha(x.r as Row, (x.f as Row | null) ?? null));
  };

  // La tabla de archivos se crea sola la primera vez (no hace falta correr una migración a mano).
  let listoArchivos: Promise<unknown> | null = null;
  const tablaArchivos = () =>
    (listoArchivos ??= run(
      `create table if not exists public.usuarios (
        id uuid primary key default gen_random_uuid(),
        email text not null unique, nombre text not null, rol text not null check (rol in ('profesional','recepcion')),
        hash text not null, activo boolean not null default true, creado_en timestamptz not null default now()
      )`,
    ).then(() => run(
      `create table if not exists public.archivos (
        id uuid primary key default gen_random_uuid(),
        paciente_id uuid not null references public.pacientes (id) on delete cascade,
        nombre text not null, tipo text not null, tamano integer not null, datos bytea not null,
        creado_en timestamptz not null default now(), creado_por text not null default ''
      )`,
    )).then(() => run("create index if not exists archivos_paciente_idx on public.archivos (paciente_id)")).catch((e) => { listoArchivos = null; throw e; }));
  const META = "id, paciente_id, nombre, tipo, tamano, creado_en, creado_por";

  return {
    listServicios: () => lista("select * from public.servicios order by nombre"),
    async saveServicio(s) {
      await upsert("servicios", s, "id");
      return s;
    },
    listHorarios: () => lista("select * from public.horarios order by dia"),
    async saveHorarios(h) {
      for (const dia of h) await upsert("horarios", dia, "dia");
    },
    listBloqueos: () => lista("select * from public.bloqueos order by desde"),
    addBloqueo: (b) => insertar("bloqueos", b),
    deleteBloqueo: (id) => borrar("bloqueos", id),

    listSolicitudes: () => lista("select * from public.solicitudes order by creada_en desc"),
    getSolicitud: (id) => una("select * from public.solicitudes where id = $1", [id]),
    createSolicitud: (s) => insertar("solicitudes", { ...s, consentimientoAt: s.consentimiento ? new Date().toISOString() : "" }),
    updateSolicitud: (id, patch) => actualizar("solicitudes", id, patch),

    listPacientes: () => pacientesConFicha() as never,
    async getPaciente(id) {
      return ((await pacientesConFicha("where p.id = $1", [id]))[0] ?? null) as never;
    },
    async savePaciente(p, actor) {
      const ficha: Row = {};
      const admin: Row = {};
      for (const [k, v] of Object.entries(p)) (FICHA as readonly string[]).includes(k) ? (ficha[k] = v) : (admin[k] = v);
      const saved = await guardarAuditado<{ id: string }>("pacientes", admin, actor);
      await upsert("fichas_clinicas", { pacienteId: saved.id, ...ficha }, "paciente_id");
      return (await pacientesConFicha("where p.id = $1", [saved.id]))[0] as never;
    },
    deletePaciente: (id) => borrar("pacientes", id),

    listCitas: () => lista("select id, paciente_id, servicio, fecha, hora, duracion_min, estado, notas, creado_en, creado_por, actualizado_en, actualizado_por from public.citas order by fecha, hora"),
    async saveCita(cita, actor) {
      const saved = await guardarAuditado<Row>("citas", cita, actor);
      const { rango: _r, ...rest } = saved;
      void _r;
      return rest as never;
    },
    deleteCita: (id) => borrar("citas", id),

    listNotas: (pid) =>
      pid ? lista("select * from public.notas_seguimiento where paciente_id = $1 order by fecha desc", [pid]) : lista("select * from public.notas_seguimiento order by fecha desc"),
    saveNota: (n, actor) => guardarAuditado("notas_seguimiento", n, actor),
    deleteNota: (id) => borrar("notas_seguimiento", id),
    listPlanes: (pid) =>
      pid ? lista("select * from public.plan_tratamiento where paciente_id = $1 order by inicio desc", [pid]) : lista("select * from public.plan_tratamiento order by inicio desc"),
    savePlan: (p, actor) => guardarAuditado("plan_tratamiento", p, actor),
    deletePlan: (id) => borrar("plan_tratamiento", id),

    async listArchivos(pid) {
      await tablaArchivos();
      return lista<Archivo>(`select ${META} from public.archivos where paciente_id = $1 order by creado_en desc`, [pid]);
    },
    async saveArchivo(a, base64, actor) {
      await tablaArchivos();
      const f = await run(
        `insert into public.archivos (paciente_id, nombre, tipo, tamano, datos, creado_por) values ($1, $2, $3, $4, decode($5, 'base64'), $6) returning to_jsonb(archivos) - 'datos' as r`,
        [a.pacienteId, a.nombre, a.tipo, a.tamano, base64, actor],
      );
      return fromRow<Archivo>(f[0]?.r as Row);
    },
    async getArchivo(id) {
      await tablaArchivos();
      const f = await run(`select to_jsonb(a) - 'datos' as r, encode(datos, 'base64') as b from public.archivos a where id = $1`, [id]);
      return f[0] ? { archivo: fromRow<Archivo>(f[0].r as Row), base64: f[0].b as string } : null;
    },
    async deleteArchivo(id) {
      await tablaArchivos();
      await run("delete from public.archivos where id = $1", [id]);
    },
    async listUsuarios() {
      await tablaArchivos();
      return lista<Usuario>("select id, email, nombre, rol, activo, creado_en from public.usuarios order by nombre");
    },
    async getUsuario(id) {
      await tablaArchivos();
      return una<Usuario>("select id, email, nombre, rol, activo, creado_en from public.usuarios where id::text = $1", [id]);
    },
    async getUsuarioPorEmail(email) {
      await tablaArchivos();
      return una<Usuario & { hash: string }>("select id, email, nombre, rol, activo, creado_en, hash from public.usuarios where email = $1", [email]);
    },
    async saveUsuario(u) {
      await tablaArchivos();
      try {
        const f = u.id
          ? await run(
              "update public.usuarios set email = $1, nombre = $2, rol = $3, activo = $4, hash = coalesce($5, hash) where id::text = $6 returning to_jsonb(usuarios) - 'hash' as r",
              [u.email, u.nombre, u.rol, u.activo, u.hash ?? null, u.id],
            )
          : await run(
              "insert into public.usuarios (email, nombre, rol, activo, hash) values ($1, $2, $3, $4, $5) returning to_jsonb(usuarios) - 'hash' as r",
              [u.email, u.nombre, u.rol, u.activo, u.hash ?? ""],
            );
        return fromRow<Usuario>(f[0]?.r as Row);
      } catch (e) {
        if ((e as Error).message.includes("(23505)")) throw new ConflictError("Ya existe un usuario con ese correo.");
        throw e;
      }
    },
    async deleteUsuario(id) {
      await tablaArchivos();
      await run("delete from public.usuarios where id::text = $1", [id]);
    },
    async getSettings() {
      const filas = await run("select clave, valor from public.site_settings");
      return Object.fromEntries(filas.map((r) => [r.clave as string, r.valor]));
    },
    async saveSettings(s, actor) {
      for (const [clave, valor] of Object.entries(s)) {
        await run(
          "insert into public.site_settings (clave, valor, actualizado_por) values ($1, $2::jsonb, $3) on conflict (clave) do update set valor = excluded.valor, actualizado_por = excluded.actualizado_por, actualizado_en = now()",
          [clave, JSON.stringify(valor), actor]
        );
      }
    },
    async audit(actor, accion, entidad, entidadId = "") {
      try {
        await sql.query("insert into public.audit_log (actor, accion, entidad, entidad_id) values ($1, $2, $3, $4)", [actor, accion, entidad, entidadId]);
      } catch {
        /* la auditoría nunca debe romper la operación */
      }
    },
  };
}
