"use client";
import { useState } from "react";
import { cambiarClave } from "@/app/admin/actions";
import { IconLock } from "@/components/Icons";
import { Campo, useAct } from "./ui";

export function PerfilView({ user, puedeCambiarClave }: { user: { nombre: string; email: string; rol: string }; puedeCambiarClave: boolean }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [error, setError] = useState("");
  const { act, busy } = useAct();

  const guardar = async () => {
    if (a.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (a !== b) return setError("Las contraseñas no coinciden.");
    const r = await act(() => cambiarClave(a), "Contraseña actualizada");
    if (r.ok) { setA(""); setB(""); setError(""); } else setError(r.error);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header><h1 className="a-h1">Mi perfil</h1></header>
      <section className="a-card a-card-pad flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-teal to-teal-deep font-display text-2xl text-white" aria-hidden="true">{user.nombre[0]?.toUpperCase()}</span>
        <div>
          <p className="font-display text-lg font-semibold text-teal-deep">{user.nombre}</p>
          <p className="text-sm text-muted">{user.email}</p>
          <span className="st st-confirmada mt-1">{user.rol === "profesional" ? "Profesional" : "Recepción"}</span>
        </div>
      </section>
      <section id="seguridad" className="a-card a-card-pad scroll-mt-24">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-teal-deep"><IconLock className="size-5" /> Seguridad</h2>
        {puedeCambiarClave ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); guardar(); }}>
            <Campo label="Nueva contraseña" htmlFor="pw1"><input id="pw1" type="password" autoComplete="new-password" className="field field-sm" value={a} onChange={(e) => setA(e.target.value)} /></Campo>
            <Campo label="Repite la contraseña" htmlFor="pw2"><input id="pw2" type="password" autoComplete="new-password" className="field field-sm" value={b} onChange={(e) => setB(e.target.value)} /></Campo>
            <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{error}</p>
            <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{busy ? "Guardando…" : "Cambiar contraseña"}</button>
          </form>
        ) : (
          <p className="text-sm text-muted">Estás en modo local de prueba: el cambio de contraseña se activa al conectar Supabase Auth.</p>
        )}
      </section>
    </div>
  );
}
