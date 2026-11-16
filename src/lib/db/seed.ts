// Datos de ejemplo (ficticios) para el modo local sin base de datos. Se generan relativos a "hoy".
import type { Bloqueo, Cita, Horario, Nota, Paciente, Plan, Servicio, SiteSettings, Solicitud } from "./types";
import { addDays, todayISO } from "./dates";

const ACTOR = "demo";

export const SERVICIOS_BASE: Servicio[] = [
  { id: "fisioterapia", nombre: "Fisioterapia", descripcion: "Valoración, terapia manual y ejercicio terapéutico.", duracionMin: 60, activo: true },
  { id: "pilates", nombre: "Pilates en Mat", descripcion: "Clases guiadas de fortalecimiento, postura y flexibilidad.", duracionMin: 50, activo: true },
  { id: "personalizado", nombre: "Plan personalizado", descripcion: "Programa a medida que combina fisioterapia y Pilates.", duracionMin: 60, activo: true },
];

export const HORARIOS_BASE: Horario[] = [0, 1, 2, 3, 4, 5, 6].map((dia) => ({
  dia,
  activo: dia >= 1 && dia <= 6,
  inicio: "08:00",
  fin: dia === 6 ? "12:00" : "18:00",
  pausaInicio: dia >= 1 && dia <= 5 ? "13:00" : "",
  pausaFin: dia >= 1 && dia <= 5 ? "14:00" : "",
}));

export const SETTINGS_BASE: Partial<SiteSettings> = {};

let n = 0;
const id = (p: string) => `${p}-${++n}`;

export function crearSemilla() {
  const hoy = todayISO();
  const ts = (dias: number, h = 9) => new Date(`${addDays(hoy, dias)}T${String(h).padStart(2, "0")}:00:00-05:00`).toISOString();

  const base = {
    creadoPor: ACTOR,
    actualizadoPor: ACTOR,
  };

  const pac = (
    p: Pick<Paciente, "nombre" | "edad" | "telefono" | "servicio" | "motivoConsulta" | "patologia" | "zonas"> & Partial<Paciente>,
    diasAtras: number,
  ): Paciente => ({
    id: id("pac"),
    correo: "",
    direccion: "",
    estado: "activo",
    desde: "Entre 1 y 6 meses",
    antecedentes: "",
    medicamentos: "",
    consentimiento: true,
    consentimientoAt: ts(-diasAtras),
    creadoEn: ts(-diasAtras),
    actualizadoEn: ts(-diasAtras),
    ...base,
    ...p,
  });

  const pacientes: Paciente[] = [
    pac({ nombre: "María Fernanda Salazar", edad: 34, telefono: "0991234567", correo: "mafe.salazar@correo.com", direccion: "Cumbayá, Quito", servicio: "fisioterapia", motivoConsulta: "Dolor", patologia: "Lumbalgia mecánica", zonas: ["Espalda baja / Lumbar", "Cadera"], antecedentes: "Trabajo de oficina, 9 h sentada.", medicamentos: "Ibuprofeno ocasional" }, 70),
    pac({ nombre: "Carlos Andrés Mendoza", edad: 47, telefono: "0987654321", servicio: "fisioterapia", motivoConsulta: "Lesión deportiva", patologia: "Esguince de tobillo grado II", zonas: ["Pierna / Tobillo", "Pie"], desde: "Entre 1 y 4 semanas" }, 40),
    pac({ nombre: "Lucía Paredes", edad: 29, telefono: "0998877665", correo: "lucia.paredes@correo.com", servicio: "pilates", motivoConsulta: "Mejorar postura", patologia: "Sin diagnóstico", zonas: ["Espalda alta", "Cuello"], desde: "Menos de una semana" }, 55),
    pac({ nombre: "Jorge Luis Cevallos", edad: 61, telefono: "0976543210", servicio: "fisioterapia", motivoConsulta: "Rehabilitación", patologia: "Post-operatorio de rodilla (prótesis)", zonas: ["Muslo / Rodilla"], antecedentes: "Hipertensión.", medicamentos: "Losartán 50 mg" }, 90),
    pac({ nombre: "Andrea Villamar", edad: 38, telefono: "0965432109", correo: "andrea.v@correo.com", servicio: "pilates", motivoConsulta: "Control de dolor", patologia: "Hernia discal L4-L5", zonas: ["Espalda baja / Lumbar"], desde: "Más de 6 meses" }, 120),
    pac({ nombre: "Diego Armando Torres", edad: 25, telefono: "0954321098", servicio: "fisioterapia", motivoConsulta: "Lesión deportiva", patologia: "Tendinopatía de hombro", zonas: ["Hombro", "Brazo / Codo"], desde: "Entre 1 y 4 semanas" }, 21),
    pac({ nombre: "Patricia Aldaz", edad: 52, telefono: "0943210987", servicio: "pilates", motivoConsulta: "Bienestar general", patologia: "Osteopenia", zonas: [], medicamentos: "Calcio + vitamina D" }, 200),
    pac({ nombre: "Santiago Rivas", edad: 42, telefono: "0932109876", servicio: "fisioterapia", motivoConsulta: "Dolor", patologia: "Cervicalgia tensional", zonas: ["Cuello", "Hombro"], desde: "Entre 1 y 6 meses" }, 15),
    pac({ nombre: "Valentina Ortiz", edad: 31, telefono: "0921098765", servicio: "pilates", motivoConsulta: "Embarazo / posparto", patologia: "Diástasis abdominal", zonas: ["Espalda baja / Lumbar"], desde: "Entre 1 y 6 meses" }, 9),
    pac({ nombre: "Roberto Játiva", edad: 67, telefono: "0910987654", servicio: "fisioterapia", motivoConsulta: "Rehabilitación", patologia: "Artrosis de cadera", zonas: ["Cadera", "Muslo / Rodilla"], estado: "alta" }, 160),
    pac({ nombre: "Camila Espinosa", edad: 22, telefono: "0999988776", servicio: "pilates", motivoConsulta: "Mejorar postura", patologia: "Escoliosis leve", zonas: ["Espalda alta", "Espalda baja / Lumbar"] }, 4),
    pac({ nombre: "Henry Zambrano", edad: 49, telefono: "0988877665", servicio: "fisioterapia", motivoConsulta: "Dolor", patologia: "Síndrome del túnel carpiano", zonas: ["Muñeca / Mano"], estado: "inactivo" }, 240),
  ];

  const durs: Record<string, number> = { fisioterapia: 60, pilates: 50, personalizado: 60 };
  const citas: Cita[] = [];
  const cita = (pi: number, dia: number, hora: string, estado: Cita["estado"], notas = ""): void => {
    const p = pacientes[pi];
    citas.push({ id: id("cita"), pacienteId: p.id, servicio: p.servicio, fecha: addDays(hoy, dia), hora, duracionMin: durs[p.servicio], estado, notas, creadoEn: ts(dia - 3), actualizadoEn: ts(dia - 3), ...base });
  };
  // pasadas (atendidas)
  [[0, -28, "09:00"], [0, -21, "09:00"], [0, -14, "09:00"], [0, -7, "09:00"], [1, -20, "10:00"], [1, -13, "10:00"], [1, -6, "10:00"], [3, -26, "11:00"], [3, -19, "11:00"], [3, -12, "11:00"], [3, -5, "11:00"], [4, -9, "16:00"], [4, -2, "16:00"], [5, -8, "15:00"], [7, -4, "17:00"]].forEach(([p, d, h]) => cita(p as number, d as number, h as string, "atendida"));
  cita(2, -3, "08:00", "no_asistio");
  cita(8, -6, "10:00", "cancelada", "Avisó por enfermedad.");
  // hoy y futuras
  cita(0, 0, "09:00", "confirmada", "Control semanal.");
  cita(3, 0, "11:00", "confirmada");
  cita(2, 0, "15:00", "pendiente");
  cita(5, 0, "16:30", "confirmada", "Traer informe de resonancia.");
  cita(1, 1, "10:00", "confirmada");
  cita(4, 1, "16:00", "pendiente");
  cita(7, 2, "17:00", "confirmada");
  cita(10, 2, "09:00", "pendiente");
  cita(8, 3, "10:00", "confirmada");
  cita(0, 7, "09:00", "pendiente");
  cita(3, 7, "11:00", "pendiente");
  cita(5, 8, "15:00", "pendiente");
  cita(2, 9, "08:00", "pendiente");

  const nota = (pi: number, dia: number, eva: number, d: Partial<Nota>): Nota => ({
    id: id("nota"), pacienteId: pacientes[pi].id, citaId: "", fecha: addDays(hoy, dia), eva,
    subjetivo: "", objetivo: "", tratamiento: "", observaciones: "", proximaIndicacion: "", fijada: false,
    creadoEn: ts(dia), actualizadoEn: ts(dia), ...base, ...d,
  });
  const notas: Nota[] = [
    nota(0, -28, 8, { subjetivo: "Dolor lumbar al estar sentada más de una hora. Irradia a glúteo derecho.", objetivo: "Contractura de paravertebrales L3-L5. Flexión limitada al 60 %.", tratamiento: "Terapia manual, liberación miofascial, calor local.", proximaIndicacion: "Pausas activas cada hora.", fijada: true, observaciones: "Alerta: evitar manipulación de alta velocidad hasta descartar radiculopatía." }),
    nota(0, -21, 6, { subjetivo: "Mejor en las mañanas, persiste por la tarde.", objetivo: "Mejor rango de flexión (75 %).", tratamiento: "Movilización lumbar, ejercicios de core suave." }),
    nota(0, -14, 5, { subjetivo: "Menos dolor al sentarse.", objetivo: "Contractura leve.", tratamiento: "Ejercicio terapéutico, estiramientos.", proximaIndicacion: "Puente de glúteo 3×12 diario." }),
    nota(0, -7, 3, { subjetivo: "Casi sin molestia, rigidez ocasional.", objetivo: "Rango completo, fuerza 4/5.", tratamiento: "Fortalecimiento de core y glúteos.", observaciones: "Buena respuesta al plan." }),
    nota(1, -20, 7, { subjetivo: "Dolor e hinchazón en tobillo derecho.", objetivo: "Edema moderado, dolor a la inversión.", tratamiento: "Crioterapia, vendaje funcional, movilidad suave." }),
    nota(1, -13, 5, { subjetivo: "Apoya mejor.", objetivo: "Edema leve.", tratamiento: "Ejercicios de propiocepción." }),
    nota(1, -6, 3, { subjetivo: "Camina sin cojera.", objetivo: "Rango casi completo.", tratamiento: "Fortalecimiento peroneos.", proximaIndicacion: "Evitar correr 2 semanas." }),
    nota(3, -26, 6, { subjetivo: "Rigidez de rodilla a las 6 semanas del postoperatorio.", objetivo: "Flexión 85°.", tratamiento: "Movilización articular, bicicleta estática." }),
    nota(3, -12, 4, { subjetivo: "Mejor marcha.", objetivo: "Flexión 105°.", tratamiento: "Fortalecimiento de cuádriceps." }),
    nota(3, -5, 3, { subjetivo: "Sube escaleras con apoyo.", objetivo: "Flexión 115°.", tratamiento: "Marcha y equilibrio.", proximaIndicacion: "Caminata 20 min diaria.", fijada: true }),
    nota(4, -9, 5, { subjetivo: "Dolor lumbar con la clase de Pilates intensa.", objetivo: "Sin signos de alarma.", tratamiento: "Adaptar ejercicios, evitar flexión de columna con carga." }),
  ];

  const plan = (pi: number, p: Partial<Plan>): Plan => ({
    id: id("plan"), pacienteId: pacientes[pi].id, titulo: "", objetivo: "", frecuencia: "", sesionesTotales: 10, sesionesHechas: 0,
    inicio: addDays(hoy, -30), estado: "activo", notas: "", creadoEn: ts(-30), actualizadoEn: ts(-30), ...base, ...p,
  });
  const planes: Plan[] = [
    plan(0, { titulo: "Control de lumbalgia", objetivo: "Eliminar dolor y reeducar postura de trabajo", frecuencia: "1 vez por semana", sesionesTotales: 8, sesionesHechas: 4 }),
    plan(1, { titulo: "Recuperación de esguince", objetivo: "Volver a correr sin dolor", frecuencia: "2 veces por semana", sesionesTotales: 6, sesionesHechas: 3, inicio: addDays(hoy, -20) }),
    plan(3, { titulo: "Rehabilitación post-prótesis", objetivo: "Flexión de rodilla ≥ 120° y marcha independiente", frecuencia: "1 vez por semana", sesionesTotales: 12, sesionesHechas: 4, inicio: addDays(hoy, -26) }),
  ];

  const sol = (s: Partial<Solicitud> & Pick<Solicitud, "nombre" | "servicio" | "fecha" | "hora">, horasAtras: number): Solicitud => ({
    id: id("sol"), creadaEn: new Date(Date.now() - horasAtras * 3600e3).toISOString(), estado: "nueva", paciente: "nuevo", edad: 30,
    telefono: "0990000000", correo: "", motivoConsulta: "Dolor", patologia: "", zonas: [], desde: "Entre 1 y 4 semanas", antecedentes: "",
    medicamentos: "", direccion: "", adicional: "", consentimiento: true, consentimientoAt: new Date(Date.now() - horasAtras * 3600e3).toISOString(),
    propuestaFecha: "", propuestaHora: "", motivoRechazo: "", pacienteId: "", citaId: "", ...s,
  });
  const solicitudes: Solicitud[] = [
    sol({ nombre: "Gabriela Montenegro", servicio: "fisioterapia", fecha: addDays(hoy, 2), hora: "11:00", edad: 36, telefono: "0995551122", correo: "gabi.montenegro@correo.com", motivoConsulta: "Dolor", patologia: "Dolor de hombro derecho al levantar el brazo", zonas: ["Hombro", "Cuello"], desde: "Entre 1 y 6 meses", antecedentes: "Cirugía de vesícula (2019).", medicamentos: "Ninguno", direccion: "La Floresta, Quito", adicional: "Prefiero horarios de la mañana." }, 2),
    sol({ nombre: "Esteban Cárdenas", servicio: "pilates", fecha: addDays(hoy, 3), hora: "17:00", edad: 28, telefono: "0994443322", motivoConsulta: "Mejorar postura", zonas: ["Espalda alta"], desde: "Más de 6 meses", paciente: "nuevo" }, 5),
    sol({ nombre: "Rosa Elena Quishpe", servicio: "fisioterapia", fecha: addDays(hoy, 1), hora: "09:00", edad: 58, telefono: "0993332211", motivoConsulta: "Rehabilitación", patologia: "Fractura de muñeca (yeso retirado hace 1 semana)", zonas: ["Muñeca / Mano"], paciente: "nuevo", medicamentos: "Calcio" }, 20),
    sol({ nombre: "Marcos Tapia", servicio: "fisioterapia", fecha: addDays(hoy, -2), hora: "10:00", edad: 44, telefono: "0992221100", estado: "rechazada", motivoRechazo: "Fuera de horario de atención." }, 90),
    sol({ nombre: "Lucía Paredes", servicio: "pilates", fecha: addDays(hoy, -9), hora: "08:00", edad: 29, telefono: "0998877665", estado: "aceptada", pacienteId: pacientes[2].id }, 240),
  ];

  const bloqueos: Bloqueo[] = [{ id: id("blq"), desde: addDays(hoy, 21), hasta: addDays(hoy, 23), motivo: "Congreso de fisioterapia" }];

  return { pacientes, citas, notas, planes, solicitudes, bloqueos };
}
