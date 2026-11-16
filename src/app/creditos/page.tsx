import type { Metadata } from "next";
import Link from "next/link";
import { photoCredits } from "@/lib/credits";

export const metadata: Metadata = {
  title: "Créditos de fotos",
  robots: { index: false, follow: true },
};

export default function CreditosPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="font-semibold text-teal-deep underline-offset-4 hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-6 font-display text-3xl font-semibold text-teal-deep sm:text-4xl">Créditos de fotos</h1>
      <p className="mt-3 text-muted">Fotografías de Wikimedia Commons usadas bajo licencias Creative Commons.</p>
      <ul className="mt-8 grid gap-4">
        {photoCredits.map((c) => (
          <li key={c.page} className="glass rounded-2xl p-4">
            <a className="font-semibold text-teal-deep underline underline-offset-4" href={c.page} target="_blank" rel="noopener">
              {c.title}
            </a>
            <p className="mt-1 text-sm text-muted">
              {c.author} ·{" "}
              <a className="underline underline-offset-2" href={c.licenseUrl} target="_blank" rel="noopener">
                {c.license}
              </a>{" "}
              · Wikimedia Commons
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
