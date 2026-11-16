"use server";
// Acciones del panel. Cada una: (1) comprueba sesión y rol, (2) valida y sanea la entrada, (3) escribe y audita.
// Los errores esperados se devuelven como texto en español; nunca se incluyen datos de pacientes.
import { revalidatePath } from "next/cache";
import { authorize } from "@/lib/auth/session";
import type { Session } from "@/lib/auth/token";
import { getDb } from "@/lib/db";
import { buscarChoque } from "@/lib/db/availability";
import { calcularHoras } from "@/lib/db/disponibilidad";
import { ConflictError, type Cita, type Db, type EstadoCita, type Rol } from "@/lib/db/types";
import {
  parseBloqueo, parseCita, parseEstadoCita, parseFecha, parseHora, parseHorarios, parseId, parseNota, parsePaciente, parsePlan,
  parseServicio, parseSettings, str, ValidationError,
} from "@/lib/db/validate";

export type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const AMBOS: Rol[] = ["profesional", "recepcion"];
const SOLO_PROF: Rol[] = ["profesional"];
const FICHA = ["motivoConsulta", "patologia", "zonas", "desde", "antecedentes", "medicamentos"] as const;

async function run<T>(roles: Rol[], fn: (s: Session, db: Db) => Promise<T>): Promise<Result<T>> {
  try {
    const s = await authorize(roles);
    const db = await getDb();
    const data = await fn(s, db);
    revalidatePath("/admin", "layout");
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ValidationError || e instanceof ConflictError) return { ok: false, error: e.message };
    return { ok: false, error: "No se pudo completar la acción. Intenta de nuevo." };
  }
}

async function validarCita(db: Db, input: ReturnType<typeof parseCita>) {
  const [pac, servicios, citas] = await Promise.all([db.getPaciente(input.pacienteId), db.listServicios(), db.listCitas()]);
  if (!pac) throw new ValidationError("El paciente ya no existe");
  if (!servicios.some((s) => s.id === input.servicio)) throw new ValidationError("Servicio no válido");
  if (input.estado === "pendiente" || input.estado === "confirmada") {
    const choque = buscarChoque(citas, { fecha: input.fecha, hora: input.hora, duracionMin: input.duracionMin, excluirId: input.id });
    if (choque) throw new ConflictError(`Ese horario se cruza con otra cita a las ${choque.hora}. Elige otra hora.`);
  }
}

// ---------- pacientes ----------
export async function guardarPaciente(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const input = parsePaciente(raw);
    if (s.rol === "recepcion") {
      // Recepción no ve ni edita la ficha clínica: se conserva lo que ya existe.
      const previo = input.id ? await db.getPaciente(input.id) : null;
      for (const k of FICHA) (input as Record<string, unknown>)[k] = previo ? previo[k] : k === "zonas" ? [] : "";
    }
    const p = await db.savePaciente(input, s.id);
    await db.audit(s.id, input.id ? "editar" : "crear", "paciente", p.id);
    return { id: p.id };
  });
}

export async function eliminarPaciente(id: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    const pid = parseId(id);
    await db.deletePaciente(pid, s.id);
    await db.audit(s.id, "eliminar", "paciente", pid);
  });
}

// ---------- citas ----------
export async function guardarCita(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const input = parseCita(raw);
    await validarCita(db, input);
    const c = await db.saveCita(input, s.id);
    await db.audit(s.id, input.id ? "editar" : "crear", "cita", c.id);
    return { id: c.id };
  });
}

export async function cambiarEstadoCita(id: unknown, estado: unknown) {
  return run(AMBOS, async (s, db) => {
    const cid = parseId(id);
    const nuevo = parseEstadoCita(estado) as EstadoCita;
    const cita = (await db.listCitas()).find((c) => c.id === cid);
    if (!cita) throw new ValidationError("La cita ya no existe");
    const { id: _i, creadoEn: _a, creadoPor: _b, actualizadoEn: _c, actualizadoPor: _d, ...resto } = cita;
    void [_a, _b, _c, _d];
    const input = { ...resto, id: cid, estado: nuevo };
    await validarCita(db, input);
    await db.saveCita(input, s.id);
    await db.audit(s.id, `estado:${nuevo}`, "cita", cid);
  });
}

export async function eliminarCita(id: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    const cid = parseId(id);
    await db.deleteCita(cid, s.id);
    await db.audit(s.id, "eliminar", "cita", cid);
  });
}

export async function horasDisponibles(fecha: unknown, servicio: unknown, excluirCitaId?: unknown) {
  return run(AMBOS, async (_s, db) => {
    return calcularHoras(db, parseFecha(fecha), str(servicio, 40), excluirCitaId ? parseId(excluirCitaId) : undefined);
  });
}

// ---------- historia clínica (solo profesional) ----------
export async function guardarNota(raw: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    const input = parseNota(raw);
    const n = await db.saveNota(input, s.id);
    await db.audit(s.id, input.id ? "editar" : "crear", "nota", n.id);
    return { id: n.id };
  });
}
export async function eliminarNota(id: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    const nid = parseId(id);
    await db.deleteNota(nid, s.id);
    await db.audit(s.id, "eliminar", "nota", nid);
  });
}
export async function guardarPlan(raw: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    const input = parsePlan(raw);
    const p = await db.savePlan(input, s.id);
    await db.audit(s.id, input.id ? "editar" : "crear", "plan", p.id);
    return { id: p.id };
  });
}
export async function eliminarPlan(id: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    const pid = parseId(id);
    await db.deletePlan(pid, s.id);
    await db.audit(s.id, "eliminar", "plan", pid);
  });
}

// ---------- solicitudes ----------
const soloDigitos = (t: string) => t.replace(/\D/g, "");

export async function aceptarSolicitud(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const b = (raw ?? {}) as Record<string, unknown>;
    const sol = await db.getSolicitud(parseId(b.id));
    if (!sol) throw new ValidationError("La solicitud ya no existe");
    if (sol.estado === "aceptada") throw new ValidationError("Esta solicitud ya fue aceptada");
    const fecha = b.fecha ? parseFecha(b.fecha) : sol.propuestaFecha || sol.fecha;
    const hora = b.hora ? parseHora(b.hora) : sol.propuestaHora || sol.hora;
    const servicios = await db.listServicios();
    const servicio = servicios.find((x) => x.id === sol.servicio);
    if (!servicio) throw new ValidationError("El servicio de la solicitud ya no existe");

    const citas = await db.listCitas();
    const choque = buscarChoque(citas, { fecha, hora, duracionMin: servicio.duracionMin });
    if (choque) throw new ConflictError(`Ese horario se cruza con otra cita a las ${choque.hora}. Propón otra hora.`);

    // Paciente existente (mismo teléfono) o nuevo. La ficha se escribe con permisos de servicio (acción ya autorizada).
    const dbElev = await getDb({ elevated: true });
    const tel = soloDigitos(sol.telefono);
    const existentes = await dbElev.listPacientes();
    let pacienteId = sol.pacienteId || existentes.find((p) => soloDigitos(p.telefono) === tel && tel.length >= 7)?.id || "";
    if (!pacienteId) {
      const p = await dbElev.savePaciente(
        {
          nombre: sol.nombre, ...(sol.dni ? { dni: sol.dni } : {}), edad: sol.edad, telefono: sol.telefono, correo: sol.correo, direccion: sol.direccion, servicio: sol.servicio,
          estado: "activo", motivoConsulta: sol.motivoConsulta, patologia: sol.patologia, zonas: sol.zonas, desde: sol.desde,
          antecedentes: sol.antecedentes, medicamentos: sol.medicamentos, consentimiento: sol.consentimiento,
          consentimientoAt: sol.consentimientoAt || new Date().toISOString(),
        },
        s.id,
      );
      pacienteId = p.id;
    }
    const cita = await db.saveCita(
      { pacienteId, servicio: sol.servicio, fecha, hora, duracionMin: servicio.duracionMin, estado: "confirmada", notas: sol.adicional ? `Nota de la solicitud: ${sol.adicional}` : "" },
      s.id,
    );
    await db.updateSolicitud(sol.id, { estado: "aceptada", pacienteId, citaId: cita.id }, s.id);
    await db.audit(s.id, "aceptar", "solicitud", sol.id);
    return { pacienteId, citaId: cita.id, fecha, hora };
  });
}

export async function proponerHora(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const b = (raw ?? {}) as Record<string, unknown>;
    const sol = await db.getSolicitud(parseId(b.id));
    if (!sol) throw new ValidationError("La solicitud ya no existe");
    if (sol.estado === "aceptada") throw new ValidationError("Esta solicitud ya fue aceptada");
    const fecha = parseFecha(b.fecha);
    const hora = parseHora(b.hora);
    const libres = await calcularHoras(db, fecha, sol.servicio);
    if (!libres.includes(hora)) throw new ValidationError("Esa hora no está libre. Elige una de las horas sugeridas.");
    await db.updateSolicitud(sol.id, { estado: "reprogramada", propuestaFecha: fecha, propuestaHora: hora }, s.id);
    await db.audit(s.id, "proponer-hora", "solicitud", sol.id);
    return { fecha, hora };
  });
}

export async function rechazarSolicitud(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const b = (raw ?? {}) as Record<string, unknown>;
    const sol = await db.getSolicitud(parseId(b.id));
    if (!sol) throw new ValidationError("La solicitud ya no existe");
    if (sol.estado === "aceptada") throw new ValidationError("Esta solicitud ya fue aceptada");
    await db.updateSolicitud(sol.id, { estado: "rechazada", motivoRechazo: str(b.motivo, 300) }, s.id);
    await db.audit(s.id, "rechazar", "solicitud", sol.id);
  });
}

// ---------- servicios y horarios ----------
export async function guardarServicio(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const sv = parseServicio(raw);
    await db.saveServicio(sv, s.id);
    await db.audit(s.id, "guardar", "servicio", sv.id);
  });
}
export async function guardarHorarios(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    await db.saveHorarios(parseHorarios(raw), s.id);
    await db.audit(s.id, "guardar", "horarios");
  });
}
export async function agregarBloqueo(raw: unknown) {
  return run(AMBOS, async (s, db) => {
    const b = await db.addBloqueo(parseBloqueo(raw), s.id);
    await db.audit(s.id, "crear", "bloqueo", b.id);
  });
}
export async function eliminarBloqueo(id: unknown) {
  return run(AMBOS, async (s, db) => {
    const bid = parseId(id);
    await db.deleteBloqueo(bid, s.id);
    await db.audit(s.id, "eliminar", "bloqueo", bid);
  });
}

// ---------- sitio web ----------
export async function guardarSitio(raw: unknown) {
  return run(SOLO_PROF, async (s, db) => {
    await db.saveSettings(parseSettings(raw), s.id);
    revalidatePath("/");
    await db.audit(s.id, "guardar", "sitio");
  });
}

export type { Cita };
