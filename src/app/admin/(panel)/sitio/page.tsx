import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { faqs as faqsBase, site } from "@/lib/site";
import type { SiteSettings } from "@/lib/db/types";
import { SitioView } from "@/components/admin/SitioView";

export const metadata = { title: "Sitio web" };

export default async function SitioPage() {
  await requireSession(["profesional"]);
  const g = await (await getDb()).getSettings();
  const inicial: SiteSettings = {
    heroTitulo: g.heroTitulo ?? "",
    heroDescripcion: g.heroDescripcion ?? "",
    whatsapp: g.whatsapp ?? site.whatsapp,
    correo: g.correo ?? site.email,
    direccion: g.direccion ?? site.address,
    horarios: g.horarios ?? site.hours,
    instagram: g.instagram ?? site.instagram,
    faqs: g.faqs?.length ? g.faqs : faqsBase.map((f) => ({ q: f.q, a: f.a })),
  };
  return <SitioView inicial={inicial} />;
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
