"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void> };

export function InstallButton({ className = "" }: { className?: string }) {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hint, setHint] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!evt && !ios)) return null;

  return (
    <span className="relative">
      <button
        type="button"
        className={`btn btn-ghost ${className}`}
        onClick={async () => {
          if (evt) {
            await evt.prompt();
            setEvt(null);
          } else {
            setHint((h) => !h);
          }
        }}
      >
        Instalar app
      </button>
      {hint && (
        <span role="status" className="glass absolute right-0 top-14 z-50 w-64 rounded-2xl p-4 text-sm text-ink">
          En Safari toca <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.
        </span>
      )}
    </span>
  );
}
