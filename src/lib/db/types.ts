// Tipos del dominio y contrato de la capa de datos (interfaz `Db`).
// Fechas: "YYYY-MM-DD". Horas: "HH:MM". Marcas de tiempo: ISO 8601.

export type Rol = "profesional" | "recepcion";

export type Servicio = {
  id: string; // slug: "fisioterapia" | "pilates" | ...
  nombre: string;
  descripcion: string;
  duracionMin: number;
  activo: boolean;
};

/** dia: 0 = domingo … 6 = sábado */
export type Horario = {
  dia: number;
  activo: boolean;
  inicio: string;
  fin: string;
  pausaInicio: string; // "" si no hay pausa
  pausaFin: string;
};

export type Bloqueo = { id: string; desde: string; hasta: string; motivo: string };

export type EstadoSolicitud = "nueva" | "aceptada" | "reprogramada" | "rechazada";

export type Solicitud = {
  id: string;
  creadaEn: string;
  estado: EstadoSolicitud;
  servicio: string;
  paciente: "nuevo" | "paciente";
  fecha: string;
  hora: string;
  nombre: string;
  dni?: string;
  edad: number;
  telefono: string;
  correo: string;
  motivoConsulta: string;
  patologia: string;
  zonas: string[];
  desde: string;
  antecedentes: string;
  medicamentos: string;
  direccion: string;
  adicional: string;
  consentimiento: boolean;
  consentimientoAt: string;
  propuestaFecha: string;
  propuestaHora: string;
  motivoRechazo: string;
  pacienteId: string;
  citaId: string;
};

/** Datos que llegan de la landing (ya saneados). */
export type NuevaSolicitud = Pick<
  Solicitud,
  | "servicio" | "paciente" | "fecha" | "hora" | "nombre" | "dni" | "edad" | "telefono" | "correo" | "motivoConsulta"
  | "patologia" | "zonas" | "desde" | "antecedentes" | "medicamentos" | "direccion" | "adicional" | "consentimiento"
>;

export type EstadoPaciente = "activo" | "alta" | "inactivo";

export type Paciente = {
  id: string;
  nombre: string;
  dni?: string;
  edad: number | null;
  telefono: string;
  correo: string;
  direccion: string;
  servicio: string; // servicio principal
  estado: EstadoPaciente;
  motivoConsulta: string;
  patologia: string;
  zonas: string[];
  desde: string;
  antecedentes: string;
  medicamentos: string;
  consentimiento: boolean;
  consentimientoAt: string; // ISO o ""
  creadoEn: string;
  creadoPor: string;
  actualizadoEn: string;
  actualizadoPor: string;
};
export type PacienteInput = Omit<Paciente, "id" | "creadoEn" | "creadoPor" | "actualizadoEn" | "actualizadoPor"> & { id?: string };

export type EstadoCita = "pendiente" | "confirmada" | "atendida" | "cancelada" | "no_asistio";

export type Cita = {
  id: string;
  pacienteId: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracionMin: number;
  estado: EstadoCita;
  notas: string;
  creadoEn: string;
  creadoPor: string;
  actualizadoEn: string;
  actualizadoPor: string;
};
export type CitaInput = Omit<Cita, "id" | "creadoEn" | "creadoPor" | "actualizadoEn" | "actualizadoPor"> & { id?: string };

export type Nota = {
  id: string;
  pacienteId: string;
  citaId: string;
  fecha: string;
  eva: number; // 0–10
  subjetivo: string;
  objetivo: string;
  tratamiento: string;
  observaciones: string;
  proximaIndicacion: string;
  fijada: boolean;
  creadoEn: string;
  creadoPor: string;
  actualizadoEn: string;
  actualizadoPor: string;
};
export type NotaInput = Omit<Nota, "id" | "creadoEn" | "creadoPor" | "actualizadoEn" | "actualizadoPor"> & { id?: string };

export type EstadoPlan = "activo" | "completado" | "pausado";
export type Plan = {
  id: string;
  pacienteId: string;
  titulo: string;
  objetivo: string;
  frecuencia: string;
  sesionesTotales: number;
  sesionesHechas: number;
  inicio: string;
  estado: EstadoPlan;
  notas: string;
  creadoEn: string;
  creadoPor: string;
  actualizadoEn: string;
  actualizadoPor: string;
};
export type PlanInput = Omit<Plan, "id" | "creadoEn" | "creadoPor" | "actualizadoEn" | "actualizadoPor"> & { id?: string };

export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
};

export type Archivo = {
  id: string;
  pacienteId: string;
  nombre: string;
  tipo: string; // MIME
  tamano: number; // bytes
  creadoEn: string;
  creadoPor: string;
};

/** Textos editables de la web. Todos opcionales; los vacíos usan el valor por defecto de `src/lib/site.ts`. */
export type SiteSettings = {
  heroTitulo: string;
  heroDescripcion: string;
  whatsapp: string;
  correo: string;
  direccion: string;
  horarios: string;
  instagram: string;
  faqs: { q: string; a: string }[];
};

export type Db = {
  // servicios y horarios
  listServicios(): Promise<Servicio[]>;
  saveServicio(s: Servicio, actor: string): Promise<Servicio>;
  listHorarios(): Promise<Horario[]>;
  saveHorarios(h: Horario[], actor: string): Promise<void>;
  listBloqueos(): Promise<Bloqueo[]>;
  addBloqueo(b: Omit<Bloqueo, "id">, actor: string): Promise<Bloqueo>;
  deleteBloqueo(id: string, actor: string): Promise<void>;
  // solicitudes
  listSolicitudes(): Promise<Solicitud[]>;
  getSolicitud(id: string): Promise<Solicitud | null>;
  createSolicitud(s: NuevaSolicitud): Promise<Solicitud>;
  updateSolicitud(id: string, patch: Partial<Solicitud>, actor: string): Promise<Solicitud>;
  // pacientes
  listPacientes(): Promise<Paciente[]>;
  getPaciente(id: string): Promise<Paciente | null>;
  savePaciente(p: PacienteInput, actor: string): Promise<Paciente>;
  deletePaciente(id: string, actor: string): Promise<void>;
  // citas
  listCitas(): Promise<Cita[]>;
  saveCita(c: CitaInput, actor: string): Promise<Cita>;
  deleteCita(id: string, actor: string): Promise<void>;
  // clínico
  listNotas(pacienteId?: string): Promise<Nota[]>;
  saveNota(n: NotaInput, actor: string): Promise<Nota>;
  deleteNota(id: string, actor: string): Promise<void>;
  listPlanes(pacienteId?: string): Promise<Plan[]>;
  savePlan(p: PlanInput, actor: string): Promise<Plan>;
  deletePlan(id: string, actor: string): Promise<void>;
  // archivos del paciente (contenido en base64; solo profesional)
  listArchivos(pacienteId: string): Promise<Archivo[]>;
  saveArchivo(a: Pick<Archivo, "pacienteId" | "nombre" | "tipo" | "tamano">, base64: string, actor: string): Promise<Archivo>;
  getArchivo(id: string): Promise<{ archivo: Archivo; base64: string } | null>;
  deleteArchivo(id: string, actor: string): Promise<void>;
  // usuarios del panel (modo Neon / local; con Supabase se gestionan en Supabase Auth)
  listUsuarios(): Promise<Usuario[]>;
  getUsuario(id: string): Promise<Usuario | null>;
  /** Para iniciar sesión: incluye el hash de la contraseña. */
  getUsuarioPorEmail(email: string): Promise<(Usuario & { hash: string }) | null>;
  saveUsuario(u: { id?: string; email: string; nombre: string; rol: Rol; activo: boolean; hash?: string }): Promise<Usuario>;
  deleteUsuario(id: string): Promise<void>;
  // web
  getSettings(): Promise<Partial<SiteSettings>>;
  saveSettings(s: Partial<SiteSettings>, actor: string): Promise<void>;
  /** Auditoría: quién hizo qué (nunca contenido clínico). */
  audit(actor: string, accion: string, entidad: string, entidadId?: string): Promise<void>;
};

export class ConflictError extends Error {}
