"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cerrarSesion } from "@/app/admin/login/actions";
import { IconCalendar } from "@/components/Icons";
import { norm } from "@/lib/admin/format";
import { IconGlobe, IconHome, IconInbox, IconLogout, IconMenu, IconSearch, IconSliders, IconUser2, IconUsers } from "./icons";
import { Estado, Modal, UiProvider } from "./ui";

type Indice = { pacientes: { id: string; nombre: string; telefono: string }[]; solicitudes: { id: string; nombre: string; estado: string }[] };
type Props = {
  user: { nombre: string; email: string; rol: "profesional" | "recepcion" };
  modoLocal: boolean;
  nuevas: number;
  indice: Indice;
  children: ReactNode;
};

const NAV = [
  { href: "/admin", label: "Inicio", Icon: IconHome, exact: true },
  { href: "/admin/solicitudes", label: "Solicitudes", Icon: IconInbox },
  { href: "/admin/pacientes", label: "Pacientes", Icon: IconUsers },
  { href: "/admin/citas", label: "Citas", Icon: IconCalendar },
  { href: "/admin/servicios", label: "Servicios y horarios", Icon: IconSliders },
  { href: "/admin/sitio", label: "Sitio web", Icon: IconGlobe, soloProfesional: true },
];

export function AdminShell({ user, modoLocal, nuevas, indice, children }: Props) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [buscar, setBuscar] = useState(false);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const escribiendo = ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscar(true);
      } else if (e.key === "/" && !escribiendo) {
        e.preventDefault();
        setBuscar(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = NAV.filter((n) => !n.soloProfesional || user.rol === "profesional");

  const nav = (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {items.map(({ href, label, Icon, exact }) => {
        const activo = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className="side-link" aria-current={activo ? "page" : undefined}>
            <Icon className="size-5 shrink-0" />
            <span>{label}</span>
            {href === "/admin/solicitudes" && nuevas > 0 && <span className="a-badge" aria-label={`${nuevas} nuevas`}>{nuevas}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <UiProvider>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Saltar al contenido</a>
      <div className="lg:grid lg:grid-cols-[16.5rem_1fr]">
        {menu && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setMenu(false)} aria-hidden="true" />}
        <aside
          id="menu-lateral"
          className={`glass fixed inset-y-0 left-0 z-40 flex w-72 flex-col gap-5 p-4 transition-transform duration-300 lg:sticky lg:top-0 lg:z-10 lg:h-dvh lg:w-auto lg:translate-x-0 ${menu ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Link href="/admin" className="flex items-center gap-2 px-2 pt-1">
            <Image src="/brand/logo-horizontal-color.svg" alt="TANFIP" width={150} height={46} className="h-10 w-auto" />
          </Link>
          {nav}
          <div className="mt-auto space-y-3">
            {modoLocal && <p className="rounded-xl bg-[#fff4d6] px-3 py-2 text-xs text-[#6d4c00]">Modo local: datos de ejemplo, sin base de datos.</p>}
          </div>
        </aside>
        <div className="min-w-0">
          <header className="glass sticky top-0 z-30 flex h-14 items-center gap-2 px-3 lg:px-6">
            <button type="button" className="btn-icon lg:hidden" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-controls="menu-lateral" aria-label="Abrir menú">
              <IconMenu />
            </button>
            <Image src="/brand/logo-horizontal-color.svg" alt="TANFIP" width={110} height={34} className="h-8 w-auto lg:hidden" />
            <button type="button" onClick={() => setBuscar(true)} className="field field-sm ml-2 hidden w-72 items-center gap-2 text-left text-muted lg:flex">
              <IconSearch className="size-4" />
              <span className="flex-1">Buscar paciente o solicitud…</span>
              <kbd className="a-kbd">/</kbd>
            </button>
            <button type="button" className="btn-icon ml-auto lg:hidden" onClick={() => setBuscar(true)} aria-label="Buscar">
              <IconSearch />
            </button>
            <PerfilMenu user={user} />
          </header>
          <main id="contenido" className="adm-main w-full min-w-0" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

      <Buscador open={buscar} onClose={() => setBuscar(false)} indice={indice} rol={user.rol} />
    </UiProvider>
  );
}

function Buscador({ open, onClose, indice }: { open: boolean; onClose: () => void; indice: Indice; rol: string }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const resultados = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return [];
    const tel = n.replace(/\D/g, "");
    const pac = indice.pacientes
      .filter((p) => norm(p.nombre).includes(n) || (tel.length >= 3 && p.telefono.replace(/\D/g, "").includes(tel)))
      .slice(0, 6)
      .map((p) => ({ key: "p" + p.id, href: `/admin/pacientes/${p.id}`, titulo: p.nombre, sub: "Paciente · " + p.telefono, estado: "" }));
    const sol = indice.solicitudes
      .filter((s) => norm(s.nombre).includes(n))
      .slice(0, 4)
      .map((s) => ({ key: "s" + s.id, href: `/admin/solicitudes?id=${s.id}`, titulo: s.nombre, sub: "Solicitud", estado: s.estado }));
    return [...pac, ...sol];
  }, [q, indice]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const ir = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <Modal open={open} onClose={onClose} title="Buscar" size="sm" description="Pacientes y solicitudes">
      <div className="fieldwrap">
        <IconSearch className="size-5" />
        <input
          ref={inputRef}
          className="field"
          placeholder="Nombre o teléfono…"
          value={q}
          role="combobox"
          aria-expanded={resultados.length > 0}
          aria-controls="res-busqueda"
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => Math.min(s + 1, resultados.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => Math.max(s - 1, 0));
            } else if (e.key === "Enter" && resultados[sel]) ir(resultados[sel].href);
          }}
        />
      </div>
      <ul id="res-busqueda" role="listbox" className="mt-3 space-y-1">
        {resultados.map((r, i) => (
          <li key={r.key} role="option" aria-selected={i === sel}>
            <button
              type="button"
              onClick={() => ir(r.href)}
              onMouseEnter={() => setSel(i)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left ${i === sel ? "bg-teal/10" : ""}`}
            >
              <span>
                <span className="block text-sm font-semibold">{r.titulo}</span>
                <span className="block text-xs text-muted">{r.sub}</span>
              </span>
              {r.estado && <Estado valor={r.estado} />}
            </button>
          </li>
        ))}
        {q.trim() && resultados.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted">Sin resultados para “{q}”.</li>}
        {!q.trim() && <li className="px-3 py-4 text-center text-sm text-muted">Escribe para buscar. Atajos: <kbd className="a-kbd">/</kbd> o <kbd className="a-kbd">Ctrl</kbd> + <kbd className="a-kbd">K</kbd></li>}
      </ul>
    </Modal>
  );
}

function PerfilMenu({ user }: { user: Props["user"] }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={ref} className="relative ml-2 lg:ml-auto">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3 transition hover:bg-white"
      >
        <span className="grid size-9 place-items-center rounded-full bg-teal text-sm font-bold text-white" aria-hidden="true">{user.nombre[0]?.toUpperCase()}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold">{user.nombre}</span>
          <span className="block text-xs text-muted">{user.rol === "profesional" ? "Profesional" : "Recepción"}</span>
        </span>
      </button>
      {abierto && (
        <div role="menu" aria-label="Perfil" className="a-card absolute right-0 top-12 z-40 w-64 overflow-hidden p-1.5 shadow-xl" style={{ background: "#fff" }}>
          <div className="border-b border-teal/10 px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.nombre}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <Link role="menuitem" href="/admin/perfil" className="side-link mt-1 !min-h-10"><IconUser2 className="size-5" /> Mi perfil</Link>
          <Link role="menuitem" href="/admin/perfil#seguridad" className="side-link !min-h-10"><IconSliders className="size-5" /> Configuración de la cuenta</Link>
          <form action={cerrarSesion}>
            <button role="menuitem" type="submit" className="side-link w-full !min-h-10 text-left text-[#9b2f27]"><IconLogout className="size-5" /> Cerrar sesión</button>
          </form>
        </div>
      )}
    </div>
  );
}
