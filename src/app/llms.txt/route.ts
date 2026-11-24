// /llms.txt: resumen del sitio para asistentes de IA y buscadores generativos (GEO). Se genera desde los mismos datos de la web.
import { faqs, services, site } from "@/lib/site";

export function GET() {
  const texto = `# ${site.name} · Fisioterapia & Pilates

> Consulta de fisioterapia y Pilates en Mat de ${site.owner}, fisioterapeuta en Lima, Perú, que atiende a domicilio. Atención personalizada con valoración inicial y plan a tu ritmo. Reserva en línea.

## Datos
- Responsable: ${site.owner}, fisioterapeuta
- Cobertura: atención a domicilio en toda Lima, Perú (sin consultorio fijo)
- Teléfono / WhatsApp: ${site.phone}
- Reservas: ${site.url}/#agenda
- Idioma: español

## Servicios
${services.map((s) => `- ${s.title}: ${s.lead}`).join("\n")}

## Preguntas frecuentes
${faqs.map((f) => `- ${f.q} ${f.a}`).join("\n")}

## Páginas
- [Inicio y reservas](${site.url}/)
- [Política de privacidad](${site.url}/privacidad)
- [Términos y condiciones](${site.url}/terminos)
`;
  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
