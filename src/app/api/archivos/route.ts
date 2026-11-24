// POST /api/archivos (multipart: pacienteId, file). Solo profesional. PDF o imagen, máx. 4 MB (límite de Vercel: 4,5 MB).
import { authorize } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { parseId, ValidationError } from "@/lib/db/validate";

export const MAX_BYTES = 4 * 1024 * 1024;
const TIPOS: Record<string, string> = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Comprueba que el contenido real coincide con el tipo declarado (no basta con confiar en el navegador). */
function firmaValida(tipo: string, b: Buffer) {
  if (tipo === "application/pdf") return b.subarray(0, 4).toString("latin1") === "%PDF";
  if (tipo === "image/jpeg") return b[0] === 0xff && b[1] === 0xd8;
  if (tipo === "image/png") return b.subarray(1, 4).toString("latin1") === "PNG";
  if (tipo === "image/webp") return b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP";
  return false;
}

const fail = (error: string, status = 400) => Response.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  try {
    const s = await authorize(["profesional"]);
    const form = await req.formData();
    const pacienteId = parseId(form.get("pacienteId"));
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return fail("Elige un archivo.");
    if (file.size > MAX_BYTES) return fail("El archivo supera 4 MB.");
    if (!TIPOS[file.type]) return fail("Solo se permiten PDF, JPG, PNG o WebP.");
    const buf = Buffer.from(await file.arrayBuffer());
    if (!firmaValida(file.type, buf)) return fail("El contenido no coincide con el tipo de archivo.");

    const db = await getDb();
    if (!(await db.getPaciente(pacienteId))) return fail("El paciente ya no existe.", 404);
    const nombre = (file.name.replace(/[\u0000-\u001f\\/]/g, "").trim() || `archivo.${TIPOS[file.type]}`).slice(0, 120);
    const a = await db.saveArchivo({ pacienteId, nombre, tipo: file.type, tamano: buf.length }, buf.toString("base64"), s.id);
    await db.audit(s.id, "subir", "archivo", a.id);
    return Response.json({ ok: true, id: a.id }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message, 403);
    console.error("[archivos] subida fallida:", e instanceof Error ? e.message : "desconocido");
    return fail("No se pudo subir el archivo.", 500);
  }
}
