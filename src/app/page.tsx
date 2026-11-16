import Image from "next/image";
import { ArtBrand, ArtPhysio, ArtPilates, HeroBackdrop } from "@/components/Art";
import { RotatingTitle } from "@/components/RotatingTitle";
import { BookingForm } from "@/components/BookingForm";
import { ContactFab } from "@/components/ContactFab";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { ClientGallery } from "@/components/ClientGallery";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { IconArrow, IconCalendar, IconCheck, IconChat, IconClipboard, IconHeart, IconPilates, IconShield } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { Slot } from "@/components/Slot";
import { photo } from "@/lib/photos";
import { faqs, services, site, waLink } from "@/lib/site";

const steps = [
  { Icon: IconCalendar, t: "Solicita tu cita", d: "Elige servicio, día y hora en un formulario de 6 pasos." },
  { Icon: IconChat, t: "Te confirmamos", d: "Tania te contacta para confirmar la disponibilidad." },
  { Icon: IconHeart, t: "Te atendemos", d: "Empezamos con una valoración pensada para ti." },
];

const serviceIcon: Record<string, typeof IconHeart> = { fisioterapia: IconHeart, pilates: IconPilates, personalizado: IconClipboard };

function SectionTitle({ kicker, title, center = false }: { kicker: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="font-script text-4xl text-leaf-deep">{kicker}</p>
      <h2 className="font-display text-3xl font-semibold text-teal-deep sm:text-4xl">{title}</h2>
    </div>
  );
}

export default function Home() {
  const heroBg = photo("hero");
  return (
    <>
      <JsonLd />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Header />

      <main id="contenido" className="flex-1 overflow-x-clip">
        {/* 1 · HERO a pantalla completa */}
        <section id="inicio" className="relative isolate flex min-h-dvh items-center overflow-hidden">
          <div className="absolute inset-0 -z-10" aria-hidden={heroBg ? undefined : true}>
            {heroBg ? (
              <>
                <Image src={heroBg} alt="Sesión de fisioterapia en TANFIP" fill priority sizes="100vw" className="kenburns object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/20" />
              </>
            ) : (
              <HeroBackdrop className="size-full" />
            )}
          </div>

          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-14 lg:pt-24">
            <div>
              <p className="rise font-script text-[clamp(2.2rem,1.4rem+2vw,3.2rem)] leading-none text-teal">by {site.owner}</p>
              <RotatingTitle
                seo="Fisioterapia y Pilates en Mat con Tania Castro"
                descClassName="rise d3 mt-4 max-w-lg text-lg leading-relaxed text-muted sm:text-xl"
                className="rise d1 mt-3 font-display text-[clamp(2.25rem,1.3rem+2.8vw,3.75rem)] font-semibold leading-[1.1] text-teal-deep"
              />
              <div className="rise d4 mt-6 flex flex-wrap gap-3">
                <a href="#agenda" className="btn btn-primary">
                  <IconCalendar className="size-5" /> Solicitar mi cita <IconArrow />
                </a>
                <a href="#servicios" className="btn btn-ghost">
                  <IconClipboard className="size-5" /> Ver servicios
                </a>
              </div>
            </div>

            {/* collage animado de los servicios principales: se ajusta a la altura de la pantalla */}
            <div className="rise d2 relative mx-auto h-[clamp(16rem,50dvh,27rem)] w-full max-w-lg lg:ml-auto lg:mr-0">
              <div className="float group/tile hov absolute left-0 top-0 aspect-[4/3] w-[78%] overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-white/80">
                <div className="photo absolute inset-0">
                  <Slot name="hero-fisioterapia" alt="Sesión de fisioterapia" priority position="58% 45%" sizes="(min-width: 1024px) 28vw, 70vw" fallback={<ArtPhysio />} />
                </div>
                <span className="glass absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-teal-deep">
                  <IconHeart className="size-4" /> Fisioterapia
                </span>
              </div>
              <div
                className="float group/tile hov absolute bottom-0 right-0 aspect-[4/3] w-[72%] overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-white/80"
                style={{ animationDelay: "1.6s" }}
              >
                <div className="photo absolute inset-0">
                  <Slot name="hero-pilates" alt="Clase de Pilates en mat" position="66% 40%" sizes="(min-width: 1024px) 26vw, 65vw" fallback={<ArtPilates />} />
                </div>
                <span className="glass absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-leaf-deep">
                  <IconPilates className="size-4" /> Pilates en Mat
                </span>
              </div>
            </div>
          </div>

          <a
            href="#servicios"
            aria-label="Ir a servicios"
            className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 animate-bounce rounded-full bg-white/80 p-2 text-teal-deep shadow-md ring-1 ring-teal/15 sm:block"
          >
            <IconArrow className="size-5 rotate-90" />
          </a>
        </section>

        {/* 2 · SERVICIOS */}
        <section id="servicios" className="band band-dots mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <SectionTitle kicker="Nuestros servicios" title="Tres caminos hacia tu bienestar" />
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => {
              const Ico = serviceIcon[s.id] ?? IconHeart;
              return (
                <Reveal key={s.id} variant={i === 1 ? "zoom" : i === 0 ? "left" : "right"} delay={i * 120}>
                  <article className="glass glass-solid lift hov group/tile flex h-full flex-col overflow-hidden rounded-[2rem]">
                    <div className="relative aspect-[16/11] overflow-hidden">
                      <Slot name={s.photo} alt={s.alt} position={s.position} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" fallback={<ArtPhysio />} />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" aria-hidden="true" />
                    </div>
                    <div className="relative flex flex-1 flex-col px-7 pb-7 pt-10">
                      <span className="absolute -top-7 left-7 z-10 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-teal to-teal-deep text-white shadow-lg ring-4 ring-white">
                        <Ico className="size-7" />
                      </span>
                      <h3 className="font-display text-2xl font-semibold text-teal-deep">{s.title}</h3>
                      <p className="mt-2 text-muted">{s.lead}</p>
                      <ul className="mt-5 grid gap-3 text-[0.95rem]">
                        {s.points.map((p) => (
                          <li key={p} className="flex items-start gap-3">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf-deep">
                              <IconCheck className="size-3.5" />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      <a href="#agenda" className="btn btn-ghost mt-8 self-start">
                        <IconCalendar className="size-5" /> Agendar <IconArrow />
                      </a>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* 3 · PASOS */}
        <section id="proceso" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <SectionTitle kicker="Cómo funciona" title="Agendar es muy simple" />
          </Reveal>
          <ol className="relative mt-10 grid gap-6 md:grid-cols-3 md:gap-14">
            {steps.map(({ Icon, t, d }, i) => (
              <li key={t} className="relative">
                {i < steps.length - 1 && (
                  <span aria-hidden="true" className="absolute -right-14 top-1/2 hidden w-14 -translate-y-1/2 border-t-[3px] border-dotted border-teal/40 md:block" />
                )}
                <Reveal delay={i * 140}>
                  <div className="glass lift hov relative h-full rounded-3xl p-7">
                    <span className="relative mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-teal to-teal-deep text-white shadow-lg">
                      <Icon className="size-7" />
                      <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-leaf-deep text-xs font-bold ring-2 ring-white">
                        {i + 1}
                      </span>
                    </span>
                    <h3 className="text-lg font-semibold text-teal-deep">{t}</h3>
                    <p className="mt-1 text-muted">{d}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* 4 · FORMULARIO */}
        <section id="agenda" className="band band-dots mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="mb-8">
              <SectionTitle kicker="Reserva tu lugar" title="Solicita tu cita" center />
              <p className="mt-3 text-center text-muted">Seis pasos rápidos y te contactamos para confirmar.</p>
            </div>
          </Reveal>
          <Reveal variant="zoom" delay={100}>
            <BookingForm />
          </Reveal>
        </section>

        {/* 5 · SOBRE TANIA */}
        <section id="tania" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="glass relative grid items-center gap-10 overflow-hidden rounded-[2.5rem] p-6 sm:p-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-12">
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-leaf/15 blur-2xl" />
            <Reveal variant="zoom">
              <div className="relative mx-auto w-full max-w-[20rem] md:max-w-none">
                <div className="hov group/tile relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl ring-8 ring-white/70">
                  <div className="photo absolute inset-0">
                    <Slot name="tania" alt="Tania Castro, fisioterapeuta, durante una sesión" sizes="(min-width: 768px) 340px, 90vw" fallback={<ArtBrand />} />
                  </div>
                </div>
                <span className="glass absolute -bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-teal-deep shadow-lg">
                  <IconHeart className="size-4" /> Fisioterapeuta
                </span>
              </div>
            </Reveal>
            <Reveal variant="right" delay={120}>
              <div className="text-center md:text-left">
                <p className="font-script text-4xl text-leaf-deep">Sobre mí</p>
                <h2 className="font-display text-3xl font-semibold text-teal-deep sm:text-4xl">{site.owner}</h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted md:max-w-none">
                  Soy fisioterapeuta y creo que cada cuerpo es distinto. Por eso construyo cada plan desde una valoración cercana y lo
                  ajusto a tu ritmo, combinando fisioterapia y Pilates para que te muevas con confianza.
                </p>
                <ul className="mt-6 flex flex-wrap justify-center gap-2 md:flex-nowrap md:justify-start">
                  {["Valoración cercana", "Fisioterapia", "Pilates en Mat"].map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-medium text-teal-deep ring-1 ring-teal/15">
                      <IconCheck className="size-4 text-leaf-deep" /> {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                  <a href="#agenda" className="btn btn-primary">
                    <IconCalendar className="size-5" /> Agenda conmigo <IconArrow />
                  </a>
                  {site.whatsapp && (
                    <a
                      href={waLink("Hola Tania, vi tu página y quisiera hacerte una consulta.")}
                      target="_blank"
                      rel="noopener"
                      className="btn bg-[#25d366] text-white shadow-lg shadow-[#128c4a]/25 hover:-translate-y-0.5 hover:bg-[#1fba5a]"
                    >
                      <WhatsAppIcon className="size-5" /> Escríbeme por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

{/* 6 · SLIDER DE FOTOS */}
        <section id="galeria" className="band band-dots overflow-hidden py-16" aria-labelledby="galeria-titulo">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div id="galeria-titulo">
                <SectionTitle kicker="Así trabajamos" title="Terapia y movimiento, de cerca" center />
              </div>
            </Reveal>
          </div>
          <Reveal variant="fade" delay={100} className="mx-auto mt-8 max-w-[90rem]">
            <ClientGallery />
          </Reveal>
        </section>

        {/* 7 · PREGUNTAS FRECUENTES */}
        <section id="preguntas" className="band mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <Reveal>
            <SectionTitle kicker="Resolvemos tus dudas" title="Preguntas frecuentes" center />
          </Reveal>
          <div className="mt-10 grid gap-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 70}>
                <details className="faq glass lift rounded-2xl p-5">
                  <summary className="flex items-center justify-between gap-4 font-semibold text-teal-deep">
                    {f.q}
                    <span className="plus grid size-8 shrink-0 place-items-center rounded-full bg-teal/10 text-xl leading-none" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="faq-body mt-3 text-muted">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <ContactFab />
    </>
  );
}
