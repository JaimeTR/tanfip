import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { demoAllowed, supabaseConfigured } from "@/lib/supabase/config";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  const demo = !supabaseConfigured && demoAllowed;
  return (
    <main className="login-bg grid min-h-dvh place-items-center content-center justify-items-center px-4 py-10">
      <div className="a-card w-full max-w-md p-7 shadow-2xl shadow-teal-deep/10 sm:p-9">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/brand/isotipo-color.svg" alt="" width={72} height={72} priority className="float" />
          <h1 className="a-h1 mt-3">Panel TANFIP</h1>
          <p className="a-muted mt-1 text-sm">Ingresa con tu correo y contraseña.</p>
        </div>
        <LoginForm />
        {demo && (
          <div className="mt-6 rounded-2xl bg-mint/70 p-4 text-sm text-ink">
            <p className="font-semibold text-teal-deep">Modo local de prueba</p>
            <p className="a-muted mt-1">Sin base de datos conectada. Datos de ejemplo que se reinician al apagar el servidor.</p>
            <ul className="mt-2 space-y-1">
              <li><code className="rounded bg-white px-1.5 py-0.5">tania@tanfip.demo</code> · profesional</li>
              <li><code className="rounded bg-white px-1.5 py-0.5">recepcion@tanfip.demo</code> · recepción</li>
              <li>Contraseña: <code className="rounded bg-white px-1.5 py-0.5">tanfip-demo</code></li>
            </ul>
          </div>
        )}
      </div>
      <Link href="/" className="mt-6 text-sm font-semibold text-teal-deep underline-offset-4 hover:underline">
        ← Volver al sitio
      </Link>
    </main>
  );
}
