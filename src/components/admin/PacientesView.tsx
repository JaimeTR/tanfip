"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Paciente, Servicio } from "@/lib/db/types";
import { diaCorto, formatoTelefono, iniciales, norm } from "@/lib/admin/format";
import { IconChevronLeft, IconChevronRight, IconEdit, IconPlus, IconSearch, IconSortDown, IconSortUp } from "./icons";
import { PacienteModal } from "./PacienteModal";
import { Estado, Vacio } from "./ui";

type Orden = "nombre" | "edad" | "servicio" | "creadoEn" | "proxima";
const POR_PAGINA = 10;

export function PacientesView({
  pacientes, servicios, proxima, rol, abrirNuevo,
}: {
  pacientes: Paciente[]; servicios: Servicio[]; proxima: Record<string, string>; rol: string; abrirNuevo: boolean;
}) {
  const [q, setQ] = useState("");
  const [fServ, setFServ] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [orden, setOrden] = useState<{ k: Orden; asc: boolean }>({ k: "nombre", asc: true });
  const [pag, setPag] = useState(1);
  const [modal, setModal] = useState<{ abierto: boolean; paciente: Paciente | null }>({ abierto: abrirNuevo, paciente: null });

  const nombreServ = (id: string) => servicios.find((s) => s.id === id)?.nombre ?? "—";

  const filtrados = useMemo(() => {
    const n = norm(q.trim());
    const tel = n.replace(/\D/g, "");
    const lista = pacientes.filter(
      (p) =>
        (!fServ || p.servicio === fServ) &&
        (!fEstado || p.estado === fEstado) &&
        (!n || norm(p.nombre).includes(n) || (tel.length >= 3 && p.telefono.replace(/\D/g, "").includes(tel)) || norm(p.correo).includes(n)),
    );
    const val = (p: Paciente): string | number =>
      orden.k === "nombre" ? norm(p.nombre) : orden.k === "edad" ? (p.edad ?? -1) : orden.k === "servicio" ? nombreServ(p.servicio) : orden.k === "creadoEn" ? p.creadoEn : proxima[p.id] ?? "9999";
    return [...lista].sort((a, b) => {
      const x = val(a), y = val(b);
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es");
      return orden.asc ? c : -c;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacientes, q, fServ, fEstado, orden, proxima]);

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const actual = Math.min(pag, paginas);
  const visibles = filtrados.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA);

  const Th = ({ k, children, className = "" }: { k: Orden; children: React.ReactNode; className?: string }) => (
    <th className={className} aria-sort={orden.k === k ? (orden.asc ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => setOrden((o) => ({ k, asc: o.k === k ? !o.asc : true }))}>
        {children}
        {orden.k === k && (orden.asc ? <IconSortUp /> : <IconSortDown />)}
      </button>
    </th>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="a-h1">Pacientes</h1>
          <p className="a-muted text-sm">{pacientes.length} registrados</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ abierto: true, paciente: null })}>
          <IconPlus className="size-4" /> Nuevo paciente
        </button>
      </header>

      <div className="a-card a-card-pad grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <div className="fieldwrap">
          <IconSearch className="size-4" />
          <input className="field field-sm" style={{ paddingLeft: "2.5rem" }} placeholder="Buscar por nombre, teléfono o correo" value={q} onChange={(e) => { setQ(e.target.value); setPag(1); }} aria-label="Buscar pacientes" />
        </div>
        <select className="field field-sm" value={fServ} onChange={(e) => { setFServ(e.target.value); setPag(1); }} aria-label="Filtrar por servicio">
          <option value="">Todos los servicios</option>
          {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select className="field field-sm" value={fEstado} onChange={(e) => { setFEstado(e.target.value); setPag(1); }} aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option><option value="alta">De alta</option><option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="a-card overflow-hidden">
        {filtrados.length === 0 ? (
          <Vacio titulo={pacientes.length ? "Sin resultados" : "Aún no hay pacientes"} texto={pacientes.length ? "Prueba con otra búsqueda o quita los filtros." : "Crea el primero o acepta una solicitud de la web."}>
            {!pacientes.length && <button className="btn btn-primary btn-sm" onClick={() => setModal({ abierto: true, paciente: null })}><IconPlus className="size-4" /> Nuevo paciente</button>}
          </Vacio>
        ) : (
          <div className="overflow-x-auto">
            <table className="a-table">
              <thead>
                <tr>
                  <Th k="nombre">Paciente</Th>
                  <Th k="edad" className="hidden sm:table-cell">Edad</Th>
                  <Th k="servicio" className="hidden md:table-cell">Servicio</Th>
                  <th className="hidden lg:table-cell">Contacto</th>
                  <Th k="proxima" className="hidden sm:table-cell">Próxima cita</Th>
                  <th>Estado</th>
                  <th><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/pacientes/${p.id}`} className="flex items-center gap-3 font-semibold hover:text-teal">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-xs font-bold text-teal-deep" aria-hidden="true">{iniciales(p.nombre)}</span>
                        <span>{p.nombre}</span>
                      </Link>
                    </td>
                    <td className="hidden sm:table-cell">{p.edad ?? "—"}</td>
                    <td className="hidden md:table-cell">{nombreServ(p.servicio)}</td>
                    <td className="hidden text-sm lg:table-cell">{p.telefono ? formatoTelefono(p.telefono) : "—"}</td>
                    <td className="hidden whitespace-nowrap text-sm sm:table-cell">{proxima[p.id] ? `${diaCorto(proxima[p.id].slice(0, 10))} · ${proxima[p.id].slice(11)}` : <span className="text-muted">—</span>}</td>
                    <td><Estado valor={p.estado} /></td>
                    <td className="text-right">
                      <button type="button" className="btn-icon" aria-label={`Editar ${p.nombre}`} onClick={() => setModal({ abierto: true, paciente: p })}><IconEdit /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtrados.length > POR_PAGINA && (
          <nav className="flex items-center justify-between gap-3 border-t border-teal/10 px-4 py-3 text-sm" aria-label="Paginación">
            <span className="text-muted">{(actual - 1) * POR_PAGINA + 1}–{Math.min(actual * POR_PAGINA, filtrados.length)} de {filtrados.length}</span>
            <span className="flex items-center gap-2">
              <button type="button" className="btn-icon" disabled={actual === 1} onClick={() => setPag(actual - 1)} aria-label="Página anterior"><IconChevronLeft /></button>
              <span aria-current="page">{actual} / {paginas}</span>
              <button type="button" className="btn-icon" disabled={actual === paginas} onClick={() => setPag(actual + 1)} aria-label="Página siguiente"><IconChevronRight /></button>
            </span>
          </nav>
        )}
      </div>

      <PacienteModal open={modal.abierto} paciente={modal.paciente} servicios={servicios} rol={rol} onClose={() => setModal((m) => ({ ...m, abierto: false }))} />
    </div>
  );
}
