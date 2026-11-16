"use client";
import { useActionState } from "react";
import { IconLock, IconMail } from "@/components/Icons";
import { iniciarSesion, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(iniciarSesion, null);
  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label className="a-label" htmlFor="email">Correo</label>
        <div className="fieldwrap">
          <IconMail className="size-5" />
          <input id="email" name="email" type="email" autoComplete="username" required className="field" placeholder="tu@correo.com" aria-invalid={!!state} />
        </div>
      </div>
      <div>
        <label className="a-label" htmlFor="password">Contraseña</label>
        <div className="fieldwrap">
          <IconLock className="size-5" />
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field" aria-invalid={!!state} />
        </div>
      </div>
      <p role="alert" className="min-h-5 text-sm font-medium text-[#9b2f27]">{state?.error}</p>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
