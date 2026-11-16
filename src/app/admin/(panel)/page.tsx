import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { addDays, monthStart, startOfWeek, todayISO } from "@/lib/db/dates";
import { diaLargo } from "@/lib/admin/format";
import { IconCalendar, IconClipboard, IconUser } from "@/components/Icons";
import { IconChart, IconInbox, IconPlus, IconUsers } from "@/components/admin/icons";
import { Estado, Vacio } from "@/components/admin/ui";

export const metadata = { title: "Inicio" };

const ACTIVAS = ["pendiente", "confirmada", "atendida"];

export default async function InicioPage() {
  const s = await requireSession();
  const db = await getDb();
  const [citas, pacientes, solicitudes, servicios] = await Promise.all([db.listCitas(), db.listPacientes(), db.listSolicitudes(), db.listServicios()]);

  const hoy = todayISO();
  const nombre = (id: string) => pacientes.find((p) => p.id === id)?.nombre ?? "Paciente";
  const nombreServ = (id: string) => servicios.find((x) => x.id === id)?.nombre ?? id;

  const deHoy = citas.filter((c) => c.fecha === hoy && c.estado !== "cancelada").sort((a, b) => a.hora.localeCompare(b.hora));
  const proximas = citas.filter((c) => c.fecha > hoy && c.fecha <= addDays(hoy, 7) && ACTIVAS.includes(c.estado));
  const nuevas = solicitudes.filter((x) => x.estado === "nueva");
  const delMes = pacientes.filter((p) => p.creadoEn.slice(0, 10) >= monthStart(hoy));

  // citas por semana: 8 semanas hasta la actual
  const lunes = startOfWeek(hoy);
  const semanas = Array.from({ length: 8 }, (_, i) => {
    const ini = addDays(lunes, (i - 7) * 7);
    const fin = addDays(ini, 6);
    return { ini, total: citas.filter((c) => c.fecha >= ini && c.fecha <= fin && ACTIVAS.includes(c.estado)).length, actual: ini === lunes };
  });
  const max = Math.max(4, ...semanas.map((w) => w.total));

  const tarjetas = [
    { k: "Citas de hoy", v: deHoy.length, Icon: IconCalendar, href: "/admin/citas", tono: "from-teal to-teal-deep" },
    { k: "Próximos 7 días", v: proximas.length, Icon: IconClipboard, href: "/admin/citas", tono: "from-teal-deep to-teal" },
    { k: "Solicitudes nuevas", v: nuevas.length, Icon: IconInbox, href: "/admin/solicitudes", tono: "from-leaf-deep to-leaf", destacada: nuevas.length > 0 },
    { k: "Pacientes nuevos (mes)", v: delMes.length, Icon: IconUsers, href: "/admin/pacientes", tono: "from-olive to-leaf" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="font-script text-3xl text-teal">Hola, {s.nombre.split(" ")[0]}</p>
        <h1 className="a-h1 capitalize">{diaLargo(hoy)}</h1>
      </header>

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map(({ k, v, Icon, href, tono, destacada }) => (
          <Link key={k} href={href} className={`a-card a-card-pad hov lift flex items-center gap-4 ${destacada ? "ring-2 ring-leaf" : ""}`}>
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tono} text-white`}>
              <Icon className="size-6" />
            </span>
            <span>
              <span className="block font-display text-3xl font-semibold leading-none text-teal-deep">{v}</span>
              <span className="mt-1 block text-sm text-muted">{k}</span>
            </span>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="a-card" aria-labelledby="agenda-h">
          <div className="flex items-center justify-between px-5 pt-4">
            <h2 id="agenda-h" className="font-display text-lg font-semibold text-teal-deep">Agenda de hoy</h2>
            <Link href="/admin/citas" className="text-sm font-semibold text-teal hover:underline">Ver agenda</Link>
          </div>
          {deHoy.length === 0 ? (
            <Vacio titulo="Día libre" texto="No hay citas para hoy. Buen momento para ordenar fichas o agendar nuevas.">
              <Link href="/admin/citas?nueva=1" className="btn btn-primary btn-sm"><IconPlus className="size-4" /> Agendar cita</Link>
            </Vacio>
          ) : (
            <ul className="divide-y divide-teal/10 px-2 py-2">
              {deHoy.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/pacientes/${c.pacienteId}`} className="flex items-center gap-4 rounded-2xl px-3 py-3 hover:bg-teal/5">
                    <span className="w-14 shrink-0 font-display text-lg font-semibold text-teal-deep">{c.hora}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{nombre(c.pacienteId)}</span>
                      <span className="block truncate text-xs text-muted">{nombreServ(c.servicio)} · {c.duracionMin} min</span>
                    </span>
                    <Estado valor={c.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="a-card a-card-pad" aria-labelledby="rapidos-h">
            <h2 id="rapidos-h" className="mb-3 font-display text-lg font-semibold text-teal-deep">Accesos rápidos</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/citas?nueva=1" className="btn btn-primary btn-sm"><IconPlus className="size-4" /> Nueva cita</Link>
              <Link href="/admin/pacientes?nuevo=1" className="btn btn-ghost btn-sm"><IconUser className="size-4" /> Nuevo paciente</Link>
              <Link href="/admin/solicitudes" className="btn btn-ghost btn-sm"><IconInbox className="size-4" /> Solicitudes</Link>
              <Link href="/admin/servicios" className="btn btn-ghost btn-sm">Horarios</Link>
            </div>
          </section>

          <section className="a-card a-card-pad" aria-labelledby="sem-h">
            <h2 id="sem-h" className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-teal-deep"><IconChart className="size-5" /> Citas por semana</h2>
            <p className="a-muted mb-3 text-xs">Últimas 8 semanas (sin canceladas)</p>
            <svg viewBox="0 0 320 150" className="w-full" role="img" aria-label={`Citas por semana: ${semanas.map((w) => w.total).join(", ")}`}>
              {[0, 0.5, 1].map((t) => (
                <g key={t}>
                  <line x1="22" x2="316" y1={118 - t * 100} y2={118 - t * 100} stroke="#1b7f8e" strokeOpacity=".12" />
                  <text x="0" y={122 - t * 100} fontSize="9" fill="#4d6a72">{Math.round(max * t)}</text>
                </g>
              ))}
              {semanas.map((w, i) => {
                const h = (w.total / max) * 100;
                const x = 30 + i * 36;
                return (
                  <g key={w.ini}>
                    <rect x={x} y={118 - h} width="24" height={Math.max(h, 1)} rx="6" fill={w.actual ? "#8bb93e" : "#1b7f8e"} opacity={w.actual ? 1 : 0.8}>
                      <title>{`Semana del ${w.ini}: ${w.total} citas`}</title>
                    </rect>
                    {w.total > 0 && <text x={x + 12} y={112 - h} fontSize="10" textAnchor="middle" fill="#14606e" fontWeight="700">{w.total}</text>}
                    <text x={x + 12} y="134" fontSize="9" textAnchor="middle" fill="#4d6a72">{w.ini.slice(8)}/{w.ini.slice(5, 7)}</text>
                  </g>
                );
              })}
            </svg>
            <p className="a-muted mt-1 text-center text-xs">Semana que inicia el (día/mes) · la verde es la actual</p>
          </section>
        </div>
      </div>
    </div>
  );
}

// Panel autenticado: lee la sesión en cada petición, no tiene sentido una navegación instantánea estática.
export const instant = false;
