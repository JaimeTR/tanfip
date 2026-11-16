// Implementación en memoria (modo local sin Supabase). Los datos viven en el proceso y se pierden al reiniciar.
import { buscarChoque } from "./availability";
import { crearSemilla, HORARIOS_BASE, SERVICIOS_BASE } from "./seed";
import {
  ConflictError,
  type Bloqueo, type Cita, type Db, type Horario, type Nota, type Paciente, type Plan, type Servicio, type SiteSettings, type Solicitud,
} from "./types";

type Store = {
  servicios: Servicio[]; horarios: Horario[]; bloqueos: Bloqueo[]; solicitudes: Solicitud[]; pacientes: Paciente[];
  citas: Cita[]; notas: Nota[]; planes: Plan[]; settings: Partial<SiteSettings>;
};

const g = globalThis as unknown as { __tanfipMem?: Store };

function store(): Store {
  if (!g.__tanfipMem) {
    const s = crearSemilla();
    g.__tanfipMem = {
      servicios: structuredClone(SERVICIOS_BASE), horarios: structuredClone(HORARIOS_BASE), settings: {},
      bloqueos: s.bloqueos, solicitudes: s.solicitudes, pacientes: s.pacientes, citas: s.citas, notas: s.notas, planes: s.planes,
    };
  }
  return g.__tanfipMem;
}

const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
const clone = <T,>(x: T): T => structuredClone(x);

function upsert<T extends { id: string; creadoEn: string; creadoPor: string; actualizadoEn: string; actualizadoPor: string }>(
  list: T[], input: Omit<T, "id" | "creadoEn" | "creadoPor" | "actualizadoEn" | "actualizadoPor"> & { id?: string }, actor: string,
): T {
  const prev = input.id ? list.find((x) => x.id === input.id) : undefined;
  if (prev) {
    Object.assign(prev, input, { actualizadoEn: now(), actualizadoPor: actor });
    return clone(prev);
  }
  const nuevo = { ...input, id: uid(), creadoEn: now(), creadoPor: actor, actualizadoEn: now(), actualizadoPor: actor } as unknown as T;
  list.push(nuevo);
  return clone(nuevo);
}

export const memoryDb: Db = {
  async listServicios() { return clone(store().servicios); },
  async saveServicio(s) {
    const st = store();
    const i = st.servicios.findIndex((x) => x.id === s.id);
    if (i >= 0) st.servicios[i] = { ...s }; else st.servicios.push({ ...s });
    return clone(s);
  },
  async listHorarios() { return clone(store().horarios); },
  async saveHorarios(h) { store().horarios = clone(h); },
  async listBloqueos() { return clone(store().bloqueos).sort((a, b) => a.desde.localeCompare(b.desde)); },
  async addBloqueo(b) { const nb = { ...b, id: uid() }; store().bloqueos.push(nb); return clone(nb); },
  async deleteBloqueo(id) { const st = store(); st.bloqueos = st.bloqueos.filter((b) => b.id !== id); },

  async listSolicitudes() { return clone(store().solicitudes).sort((a, b) => b.creadaEn.localeCompare(a.creadaEn)); },
  async getSolicitud(id) { const s = store().solicitudes.find((x) => x.id === id); return s ? clone(s) : null; },
  async createSolicitud(s) {
    const nueva: Solicitud = {
      ...s, id: uid(), creadaEn: now(), estado: "nueva", consentimientoAt: s.consentimiento ? now() : "",
      propuestaFecha: "", propuestaHora: "", motivoRechazo: "", pacienteId: "", citaId: "",
    };
    store().solicitudes.push(nueva);
    return clone(nueva);
  },
  async updateSolicitud(id, patch) {
    const s = store().solicitudes.find((x) => x.id === id);
    if (!s) throw new Error("Solicitud no encontrada");
    Object.assign(s, patch, { id });
    return clone(s);
  },

  async listPacientes() { return clone(store().pacientes).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")); },
  async getPaciente(id) { const p = store().pacientes.find((x) => x.id === id); return p ? clone(p) : null; },
  async savePaciente(p, actor) { return upsert(store().pacientes, p, actor); },
  async deletePaciente(id) {
    const st = store();
    st.pacientes = st.pacientes.filter((p) => p.id !== id);
    st.citas = st.citas.filter((c) => c.pacienteId !== id);
    st.notas = st.notas.filter((n) => n.pacienteId !== id);
    st.planes = st.planes.filter((n) => n.pacienteId !== id);
  },

  async listCitas() { return clone(store().citas).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora)); },
  async saveCita(c, actor) {
    const st = store();
    const choque = buscarChoque(st.citas, { fecha: c.fecha, hora: c.hora, duracionMin: c.duracionMin, excluirId: c.id });
    if ((c.estado === "pendiente" || c.estado === "confirmada") && choque) throw new ConflictError(`Ese horario se cruza con otra cita (${choque.hora}).`);
    return upsert(st.citas, c, actor);
  },
  async deleteCita(id) { const st = store(); st.citas = st.citas.filter((c) => c.id !== id); },

  async listNotas(pid) { return clone(store().notas.filter((n) => !pid || n.pacienteId === pid)).sort((a, b) => b.fecha.localeCompare(a.fecha)); },
  async saveNota(n, actor) { return upsert(store().notas, n, actor); },
  async deleteNota(id) { const st = store(); st.notas = st.notas.filter((n) => n.id !== id); },
  async listPlanes(pid) { return clone(store().planes.filter((n) => !pid || n.pacienteId === pid)).sort((a, b) => b.inicio.localeCompare(a.inicio)); },
  async savePlan(p, actor) { return upsert(store().planes, p, actor); },
  async deletePlan(id) { const st = store(); st.planes = st.planes.filter((n) => n.id !== id); },

  async getSettings() { return clone(store().settings); },
  async saveSettings(s) { store().settings = { ...store().settings, ...clone(s) }; },
  async audit() {},
};
