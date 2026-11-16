"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { IconLock, IconMail } from "@/components/Icons";
import { iniciarSesion, type LoginState } from "./actions";

const KEY = "tanfip:admin-email";

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(iniciarSesion, null);
  const [show, setShow] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);

  // Recuerda solo el correo en este equipo. La contraseña nunca se guarda aquí: la ofrece el administrador de contraseñas del navegador.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && emailRef.current) {
        emailRef.current.value = saved;
        if (rememberRef.current) rememberRef.current.checked = true;
      }
    } catch {
      /* sin almacenamiento: se omite */
    }
  }, []);

  function guardar() {
    try {
      if (rememberRef.current?.checked && emailRef.current?.value) localStorage.setItem(KEY, emailRef.current.value.trim());
      else localStorage.removeItem(KEY);
    } catch {
      /* sin almacenamiento: se omite */
    }
  }

  return (
    <form action={action} onSubmit={guardar} className="space-y-4" noValidate>
      <div>
        <label className="a-label" htmlFor="email">Correo</label>
        <div className="fieldwrap">
          <IconMail className="size-5" />
          <input ref={emailRef} id="email" name="email" type="email" autoComplete="username" required className="field" placeholder="tu@correo.com" aria-invalid={!!state} />
        </div>
      </div>
      <div>
        <label className="a-label" htmlFor="password">Contraseña</label>
        <div className="fieldwrap">
          <IconLock className="size-5" />
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="field !pr-12" placeholder="Tu contraseña" aria-invalid={!!state} />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={show}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-teal transition hover:bg-teal/10"
          >
            <EyeIcon off={show} />
          </button>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
        <input ref={rememberRef} type="checkbox" className="size-4 rounded accent-[#1b7f8e]" />
        Recordar mi correo en este equipo
      </label>
      <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{state?.error}</p>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
