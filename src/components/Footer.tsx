import Link from "next/link";
import { services, site } from "@/lib/site";
import { IconArrow, IconCalendar, IconChat, IconClipboard, IconHeart, IconPhone, IconPilates } from "./Icons";
import { Reveal } from "./Reveal";
import { InstagramIcon, TikTokIcon } from "./SocialIcons";
import { WhatsAppIcon } from "./WhatsAppIcon";

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#agenda", label: "Agendar cita" },
  { href: "#tania", label: "Sobre mí" },
];

const col = "text-sm font-semibold uppercase tracking-widest text-leaf";
const link = "inline-block text-white/80 transition hover:translate-x-1 hover:text-white";

export function Footer() {
  const contacts: { Icon: (p: { className?: string }) => React.ReactNode; label: string; href: string }[] = [];
  if (site.whatsapp) contacts.push({ Icon: WhatsAppIcon, label: "WhatsApp", href: `https://wa.me/${site.whatsapp}` });
  if (site.phone) contacts.push({ Icon: IconPhone, label: site.phoneDisplay, href: `tel:${site.phone}` });
  contacts.push({ Icon: IconChat, label: "Preguntas frecuentes", href: "#preguntas" });
  if (site.instagram) contacts.push({ Icon: InstagramIcon, label: "Instagram", href: site.instagram });
  if (site.tiktok) contacts.push({ Icon: TikTokIcon, label: "TikTok", href: site.tiktok });

  return (
    <footer className="relative mt-24 text-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-deep via-[#175f6c] to-[#0f4a55]">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-leaf/10 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-6">
          {/* banda de llamado a la acción */}
          <Reveal variant="zoom">
            <div className="flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-white/10 p-7 ring-1 ring-white/20 backdrop-blur sm:flex-row sm:items-center sm:p-9">
              <div>
                <p className="font-script text-4xl text-leaf">¿Lista/o para sentirte mejor?</p>
                <p className="mt-1 text-lg text-white/90">Agenda tu cita con Tania en menos de un minuto.</p>
              </div>
              <a href="#agenda" className="btn !bg-white !text-teal-deep shadow-xl hover:!bg-leaf hover:!text-white">
                <IconCalendar className="size-5" /> Solicitar mi cita <IconArrow />
              </a>
            </div>
          </Reveal>

          {/* columnas */}
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-vertical-white.svg" alt="TANFIP fisioterapia & pilates by Tania Castro" className="h-36 w-auto" />
            </div>

            <nav aria-label="Servicios">
              <h2 className={col}>Servicios</h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {services.map((s, i) => (
                  <li key={s.id}>
                    <a href="#servicios" className="flex items-center gap-2 text-white/80 transition hover:translate-x-1 hover:text-white">
                      {i === 0 ? <IconHeart className="size-4 text-leaf" /> : i === 1 ? <IconPilates className="size-4 text-leaf" /> : <IconClipboard className="size-4 text-leaf" />}
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Navegación del pie">
              <h2 className={col}>Explora</h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className={link}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className={col}>Contacto</h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {contacts.map(({ Icon, label, href }) => (
                  <li key={label}>
                    <a
                      className="flex items-center gap-3 text-white/85 underline-offset-4 hover:text-white hover:underline"
                      href={href}
                      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
                    >
                      <Icon className="size-5 shrink-0 text-leaf" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* barra inferior: una sola línea */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/15 pb-24 pt-5 text-xs sm:pb-5 text-white/65">
            <p>
              © 2026 TANFIP · Fisioterapia &amp; Pilates · by {site.owner}
            </p>
            <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
              <Link href="/privacidad" className="hover:text-white hover:underline">Privacidad</Link>
              <Link href="/terminos" className="hover:text-white hover:underline">Términos y condiciones</Link>
            </nav>
            <a href="#" className="inline-flex items-center gap-2 font-semibold text-white/85 hover:text-white">
              Volver arriba <IconArrow className="size-4 -rotate-90" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
