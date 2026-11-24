"use client";
import { useState } from "react";
import { actualizarUsuario, crearUsuario, eliminarUsuario } from "@/app/admin/actions";
import type { Usuario } from "@/lib/db/types";
import { IconPlus } from "./icons";
import { Campo, Modal, useAct, useUi } from "./ui";

type Form = { id?: string; nombre: string; email: string; rol: "profesional" | "recepcion"; activo: boolean; clave: string };
const VACIO: Form = { nombre: "", email: "", rol: "recepcion", activo: true, clave: "" };

export function UsuariosView({ usuarios, disponible, yo }: { usuarios: Usuario[]; disponible: boolean; yo: { nombre: string; email: string } }) {
  const [f, setF] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const { act, busy } = useAct();
  const { confirm } = useUi();

  const guardar = async () => {
    if (!f) return;
    const datos = { nombre: f.nombre, email: f.email, rol: f.rol, activo: f.activo };
    const r = await act(
      () => (f.id ? actualizarUsuario(f.id, datos, f.clave || undefined) : crearUsuario(datos, f.clave)),
      f.id ? "Usuario actualizado" : "Usuario creado",
    );
    if (r.ok) { setF(null); setError(""); } else setError(r.error);
  };
  const borrar = async (u: Usuario) => {
    if (await confirm({ title: "¿Eliminar usuario?", message: `${u.nombre} ya no podrá ingresar al panel.`, confirmLabel: "Eliminar", danger: true })) {
      await act(() => eliminarUsuario(u.id), "Usuario eliminado");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="a-h1">Usuarios</h1>
          <p className="a-muted text-sm">Quién puede entrar al panel. Recepción no ve la historia clínica ni los archivos.</p>
        </div>
        {disponible && <button type="button" className="btn btn-primary btn-sm" onClick={() => { setError(""); setF({ ...VACIO }); }}><IconPlus className="size-4" /> Nuevo usuario</button>}
      </header>

      <section className="a-card a-card-pad">
        <p className="text-sm"><span className="font-semibold">{yo.nombre}</span> · {yo.email} <span className="st st-confirmada ml-1">Cuenta principal</span></p>
      </section>

      {!disponible ? (
        <p className="a-card a-card-pad text-sm text-muted">La gestión de usuarios desde el panel funciona con la base Neon. Con Supabase, crea y desactiva usuarios en Supabase Auth y en la tabla <code>profiles</code>.</p>
      ) : usuarios.length === 0 ? (
        <p className="a-card a-card-pad text-sm text-muted">Aún no hay más usuarios. Crea uno para recepción.</p>
      ) : (
        <ul className="a-card divide-y divide-teal/10">
          {usuarios.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0">
                <span className="block font-semibold">{u.nombre} {!u.activo && <span className="st st-inactivo ml-1">Desactivado</span>}</span>
                <span className="a-muted block truncate text-sm">{u.email} · {u.rol === "profesional" ? "Profesional" : "Recepción"}</span>
              </span>
              <span className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setError(""); setF({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, clave: "" }); }}>Editar</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => borrar(u)}>Eliminar</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!f} onClose={() => setF(null)} title={f?.id ? "Editar usuario" : "Nuevo usuario"} size="sm"
        footer={<><button type="button" className="btn btn-ghost btn-sm" onClick={() => setF(null)}>Cancelar</button><button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={guardar}>{busy ? "Guardando…" : "Guardar"}</button></>}>
        {f && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); guardar(); }}>
            <Campo label="Nombre" htmlFor="u-nombre"><input id="u-nombre" className="field field-sm" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Campo>
            <Campo label="Correo" htmlFor="u-email"><input id="u-email" type="email" autoComplete="off" className="field field-sm" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Campo>
            <Campo label="Rol" htmlFor="u-rol">
              <select id="u-rol" className="field field-sm" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value as Form["rol"] })}>
                <option value="recepcion">Recepción</option>
                <option value="profesional">Profesional</option>
              </select>
            </Campo>
            <Campo label={f.id ? "Nueva contraseña (opcional)" : "Contraseña"} hint="Mínimo 8 caracteres." htmlFor="u-clave"><input id="u-clave" type="password" autoComplete="new-password" className="field field-sm" value={f.clave} onChange={(e) => setF({ ...f, clave: e.target.value })} /></Campo>
            {f.id && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.activo} onChange={(e) => setF({ ...f, activo: e.target.checked })} /> Usuario activo</label>}
            <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{error}</p>
            <button type="submit" className="sr-only">Guardar</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
