// Datos del negocio. Completar los vacíos cuando Tania los confirme.
export const faqs = [
  {
    q: "¿Cómo agendo mi cita?",
    a: "Completa el formulario en línea en seis pasos: elige el servicio, el día y la hora, deja tus datos y confirma. Tania te contactará para confirmar la disponibilidad.",
  },
  {
    q: "¿Qué diferencia hay entre Fisioterapia y Pilates en Mat?",
    a: "La fisioterapia evalúa y trata dolor o lesiones con un plan personalizado. El Pilates en Mat es entrenamiento guiado para fortalecer el core, mejorar la postura y ganar flexibilidad. Muchas personas combinan ambos.",
  },
  {
    q: "¿Pilates es apto si nunca lo he practicado?",
    a: "Sí. Cada sesión se adapta a tu nivel, tus objetivos y cualquier molestia que tengas.",
  },
  {
    q: "¿Qué debo llevar a mi primera cita?",
    a: "Ropa cómoda que te permita moverte. Si tienes informes, exámenes o indicaciones médicas, tráelos para revisarlos en la valoración.",
  },
  {
    q: "¿Puedo cambiar o cancelar mi cita?",
    a: "Claro. Avísanos con la mayor anticipación posible para reprogramar y dejar el espacio a otra persona.",
  },
] as const;

export const site = {
  // En Vercel, si falta NEXT_PUBLIC_SITE_URL se usa el dominio de producción (para canonical, sitemap y datos estructurados).
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3100")).replace(/\/$/, ""),
  name: "TANFIP",
  tagline: "fisioterapia & pilates",
  owner: "Tania Castro",
  whatsapp: "51949809459", // código de país (51 = Perú) + número, sin +, sin espacios
  phone: "+51949809459",
  phoneDisplay: "949 809 459",
  email: "",
  address: "",
  // SEO local: completar cuando Tania confirme dónde atiende. Con estos datos Google puede mostrarla en búsquedas "cerca de mí".
  city: "", // ej. "Lima"
  region: "", // ej. "Lima"
  country: "PE",
  lat: 0, // ej. -12.0464 (0 = sin definir)
  lng: 0, // ej. -77.0428
  hours: "",
  instagram: "", // ej. "https://www.instagram.com/usuario"
  tiktok: "", // ej. "https://www.tiktok.com/@usuario"
};

export const services = [
  {
    id: "fisioterapia",
    photo: "terapia-2",
    position: "50% 50%",
    alt: "Fisioterapeuta realizando ejercicio terapéutico con banda elástica",
    title: "Fisioterapia",
    lead: "Evaluación y tratamiento personalizado para aliviar el dolor y recuperar tu movimiento.",
    points: [
      "Valoración inicial completa",
      "Terapia manual y ejercicio terapéutico",
      "Rehabilitación de lesiones y post-operatorio",
      "Dolor de espalda, cuello y articulaciones",
    ],
  },
  {
    id: "pilates",
    photo: "pilates-1",
    position: "55% 40%",
    alt: "Mujer practicando Pilates en mat",
    title: "Pilates en Mat",
    lead: "Clases guiadas para fortalecer el core, mejorar la postura y ganar flexibilidad.",
    points: [
      "Trabajo de respiración y control",
      "Fortalecimiento de core y postura",
      "Ritmo adaptado a tu nivel",
      "Sesiones individuales o en grupo pequeño",
    ],
  },
  {
    id: "personalizado",
    photo: "terapia-1",
    position: "45% 50%",
    alt: "Terapia manual personalizada en camilla",
    title: "Plan personalizado",
    lead: "Un programa a tu medida que combina fisioterapia y Pilates según tu objetivo, tu ritmo y tu historial.",
    points: [
      "Valoración y objetivos a tu medida",
      "Fisioterapia + Pilates en un solo plan",
      "Seguimiento y ajustes por sesión",
      "Ideal para recuperación, postura y prevención",
    ],
  },
] as const;

/** Tipos de consulta del botón de contacto: cada uno envía un mensaje de WhatsApp ya redactado. */
export const consultas = [
  { id: "fisioterapia", label: "Fisioterapia", hint: "Dolor, lesión o rehabilitación", msg: "Hola Tania, quisiera una consulta de fisioterapia por dolor, lesión o rehabilitación. ¿Tienes disponibilidad para una valoración?" },
  { id: "pilates", label: "Pilates en Mat", hint: "Clases, postura y fuerza", msg: "Hola Tania, me interesa tomar clases de Pilates en Mat. ¿Qué horarios y modalidades tienes?" },
  { id: "personalizado", label: "Plan personalizado", hint: "Fisioterapia + Pilates a tu medida", msg: "Hola Tania, quisiera un plan personalizado que combine fisioterapia y Pilates. ¿Podemos coordinar una valoración?" },
  { id: "otra", label: "Otra consulta", hint: "Precios, horarios o dudas", msg: "Hola Tania, tengo una consulta. ¿Me puedes ayudar?" },
] as const;

export const waLink = (msg: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(msg)}`;
