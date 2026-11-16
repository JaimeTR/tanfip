// Textos editables de la web. La landing podrá llamar a `getSiteSettings()` (valores del admin + valores por defecto).
import "server-only";
import { faqs as faqsBase, site } from "@/lib/site";
import { getPublicDb } from "./index";
import type { SiteSettings } from "./types";

export async function getSiteSettings(): Promise<SiteSettings> {
  let guardado: Partial<SiteSettings> = {};
  try {
    guardado = (await getPublicDb()?.getSettings()) ?? {};
  } catch {
    // sin base de datos o con error: se usan los valores por defecto
  }
  const o = (v: string | undefined, def: string) => (v && v.trim() ? v : def);
  return {
    heroTitulo: o(guardado.heroTitulo, ""),
    heroDescripcion: o(guardado.heroDescripcion, ""),
    whatsapp: o(guardado.whatsapp, site.whatsapp),
    correo: o(guardado.correo, site.email),
    direccion: o(guardado.direccion, site.address),
    horarios: o(guardado.horarios, site.hours),
    instagram: o(guardado.instagram, site.instagram),
    faqs: guardado.faqs?.length ? guardado.faqs : faqsBase.map((f) => ({ q: f.q, a: f.a })),
  };
}
