import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_ACTUALIZADO = "24 de noviembre de 2026";

/** Marco común de las páginas legales. */
export function LegalPage({ titulo, intro, children }: { titulo: string; intro: string; children: ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="font-semibold text-teal-deep underline-offset-4 hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold text-teal-deep sm:text-4xl">{titulo}</h1>
      <p className="mt-2 text-sm text-muted">Última actualización: {LEGAL_ACTUALIZADO}</p>
      <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>
      <div className="mt-8 space-y-8 leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-teal-deep [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_section>*:not(h2)]:mt-2 [&_a]:font-semibold [&_a]:text-teal-deep [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
      <nav aria-label="Otras páginas legales" className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-teal/15 pt-6 text-sm">
        <Link href="/privacidad">Política de privacidad</Link>
        <Link href="/terminos">Términos y condiciones</Link>
      </nav>
    </main>
  );
}
