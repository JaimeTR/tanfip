// GET /api/archivos/:id. Solo profesional con sesión. Nunca cacheable ni indexable.
import { authorize } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { parseId, ValidationError } from "@/lib/db/validate";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await authorize(["profesional"]);
    const x = await (await getDb()).getArchivo(parseId((await params).id));
    if (!x) return new Response("No encontrado", { status: 404 });
    const db = await getDb();
    await db.audit(s.id, "ver", "archivo", x.archivo.id);
    const nombre = encodeURIComponent(x.archivo.nombre);
    return new Response(Buffer.from(x.base64, "base64"), {
      headers: {
        "Content-Type": x.archivo.tipo,
        "Content-Disposition": `inline; filename*=UTF-8''${nombre}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (e) {
    if (e instanceof ValidationError) return new Response("No autorizado", { status: 403 });
    return new Response("Error", { status: 500 });
  }
}
