"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cerrarSesion } from "@/app/admin/login/actions";
import { IconCalendar } from "@/components/Icons";
import { IconBell, IconChevronLeft, IconChevronRight, IconGlobe, IconHome, IconInbox, IconLogout, IconMenu, IconSliders, IconUser2, IconUsers } from "./icons";
import { UiProvider } from "./ui";

type Props = {
  user: { nombre: string; email: string; rol: "profesional" | "recepcion" };
  nuevas: number;
  children: ReactNode;
};

const NAV = [
  { href: "/admin", label: "Inicio", Icon: IconHome, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", Icon: IconInbox },
  { href: "/admin/pacientes", label: "Pacientes", Icon: IconUsers },
  { href: "/admin/citas", label: "Citas", Icon: IconCalendar },
  { href: "/admin/recordatorios", label: "Recordatorios", Icon: IconBell },
  { href: "/admin/servicios", label: "Servicios y horarios", Icon: IconSliders },
  { href: "/admin/sitio", label: "Sitio web", Icon: IconGlobe, soloProfesional: true },
];

export function AdminShell({ user, nuevas, children }: Props) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // Recuerda si el menú lateral estaba colapsado (solo escritorio).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColapsado(localStorage.getItem("tanfip:menu-colapsado") === "1");
    } catch {
      /* sin almacenamiento */
    }
  }, []);
  const alternar = () =>
    setColapsado((v) => {
      try {
        localStorage.setItem("tanfip:menu-colapsado", v ? "0" : "1");
      } catch {
        /* sin almacenamiento */
      }
      return !v;
    });

  useEffect(() => setMenu(false), [pathname]);
  const items = NAV.filter((n) => !n.soloProfesional || user.rol === "profesional");

  const link = (href: string, label: string, Icon: typeof IconHome, activo: boolean, extra?: ReactNode) => (
    <Link key={href} href={href} className="side-link" title={label} aria-current={activo ? "page" : undefined}>
      <Icon className="size-5 shrink-0" />
      <span>{label}</span>
      {extra}
    </Link>
  );

  const nav = (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {items.map(({ href, label, Icon, exact }) => {
        const activo = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="side-link" title={label} aria-current={activo ? "page" : undefined}>
            <Icon className="size-5 shrink-0" />
            <span>{label}</span>
            {href === "/admin/solicitudes" && nuevas > 0 && <span className="a-badge" aria-label={`${nuevas} nuevas`}>{nuevas}</span>}
          </Link>
        );
      })}
      <p className="side-hide mt-4 px-3.5 text-[0.7rem] font-semibold uppercase tracking-widest text-muted">Cuenta</p>
      <div className="side-group mt-4 flex flex-col gap-1">
        {link("/admin/perfil", "Mi perfil", IconUser2, pathname === "/admin/perfil")}
        {link("/admin/perfil#seguridad", "Configuración", IconSliders, false)}
      </div>
    </nav>
  );

  return (
    <UiProvider>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Saltar al contenido</a>
      <div className={`transition-[grid-template-columns] duration-300 lg:grid ${colapsado ? "lg:grid-cols-[5rem_1fr]" : "lg:grid-cols-[17rem_1fr]"}`}>
        {menu && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setMenu(false)} aria-hidden="true" />}
        <aside
          id="menu-lateral"
          data-colapsado={colapsado}
          className={`glass side fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-5 overflow-y-auto p-4 transition-transform duration-300 lg:sticky lg:top-0 lg:z-10 lg:h-dvh lg:w-auto lg:translate-x-0 ${menu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="side-top flex items-center justify-between gap-2 px-1 pt-1">
            <Link href="/admin" aria-label="TANFIP, inicio" className="min-w-0">
              <Image src="/brand/logo-horizontal-color.svg" alt="TANFIP" width={190} height={58} className="side-hide h-14 w-auto" priority />
              <Image src="/brand/isotipo-color.svg" alt="" width={44} height={44} className="side-iso size-11" />
            </Link>
            <button
              type="button"
              onClick={alternar}
              aria-pressed={colapsado}
              aria-label={colapsado ? "Expandir menú lateral" : "Colapsar menú lateral"}
              title={colapsado ? "Expandir menú" : "Colapsar menú"}
              className="btn-icon side-collapse shrink-0"
            >
              {colapsado ? <IconChevronRight className="size-5" /> : <IconChevronLeft className="size-5" />}
            </button>
          </div>
          {nav}
          <div className="mt-auto space-y-3">
            <PerfilBloque user={user} />
          </div>
        </aside>
        <div className="min-w-0">
          <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 px-3 lg:hidden">
            <button type="button" className="btn-icon" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-controls="menu-lateral" aria-label="Abrir menú">
              <IconMenu />
            </button>
            <Image src="/brand/logo-horizontal-color.svg" alt="TANFIP" width={140} height={42} className="h-10 w-auto" />
          </header>
          <main id="contenido" className="adm-main w-full min-w-0" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

    </UiProvider>
  );
}

function PerfilBloque({ user }: { user: Props["user"] }) {
  return (
    <div className="border-t border-teal/10 pt-3">
      <form action={cerrarSesion}>
        <button type="submit" title="Cerrar sesión" className="side-link w-full !min-h-10 text-left text-[#9b2f27]"><IconLogout className="size-5 shrink-0" /><span>Cerrar sesión</span></button>
      </form>
      <div className="side-profile mt-2 flex items-center gap-3 px-1">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal text-sm font-bold text-white" aria-hidden="true">{user.nombre[0]?.toUpperCase()}</span>
        <span className="side-hide min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold">{user.nombre}</span>
          <span className="block truncate text-xs text-muted">{user.rol === "profesional" ? "Profesional" : "Recepción"}</span>
        </span>
      </div>
    </div>
  );
}
