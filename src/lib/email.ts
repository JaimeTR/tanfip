// Avisos por correo al paciente. Usa Resend (API REST) si hay RESEND_API_KEY; si no, no envía nada.
// Nunca incluye datos clínicos: solo servicio, fecha y hora.
import "server-only";

export type EstadoCorreo = "enviado" | "sin_correo" | "no_configurado" | "error";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function enviarCorreo(para: string, asunto: string, texto: string): Promise<EstadoCorreo> {
  if (!para || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(para)) return "sin_correo";
  const key = process.env.RESEND_API_KEY;
  if (!key) return "no_configurado";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "TANFIP <onboarding@resend.dev>",
        to: [para],
        subject: asunto,
        text: texto,
        html: `<div style="font-family:Arial,sans-serif;color:#12313a;line-height:1.5">${esc(texto).replace(/\n/g, "<br>")}</div>`,
      }),
    });
    return r.ok ? "enviado" : "error";
  } catch {
    return "error";
  }
}

export const MENSAJES_CORREO = {
  aceptada: (nombre: string, servicio: string, dia: string, hora: string) => ({
    asunto: "Tu cita en TANFIP está confirmada",
    texto: `Hola ${nombre},\n\nTu cita de ${servicio} quedó confirmada para el ${dia} a las ${hora}.\n\nSi necesitas cambiarla, responde este correo o escríbenos por WhatsApp.\n\nTania Castro · TANFIP`,
  }),
  reprogramada: (nombre: string, servicio: string, dia: string, hora: string) => ({
    asunto: "Propuesta de nuevo horario · TANFIP",
    texto: `Hola ${nombre},\n\nEl horario que pediste para ${servicio} no está disponible. ¿Te sirve el ${dia} a las ${hora}? Respóndenos para confirmarlo.\n\nTania Castro · TANFIP`,
  }),
  rechazada: (nombre: string, servicio: string, motivo: string) => ({
    asunto: "Sobre tu solicitud en TANFIP",
    texto: `Hola ${nombre},\n\nGracias por escribirnos. Por ahora no podemos atender tu solicitud de ${servicio}${motivo ? `: ${motivo}` : ""}.\nCon gusto te ayudamos a buscar otra opción.\n\nTania Castro · TANFIP`,
  }),
};
