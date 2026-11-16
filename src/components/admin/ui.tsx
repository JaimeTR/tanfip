"use client";
// Piezas compartidas del panel: modal accesible, avisos (toasts), confirmaciones, chips, campos y estados vacíos.
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Result } from "@/app/admin/actions";
import { IconAlert, IconClose } from "./icons";
import { IconCheck } from "@/components/Icons";

/* ---------- Modal (dialog nativo: foco atrapado, Esc y restauración de foco) ---------- */
export function Modal({
  open, onClose, title, children, footer, size = "md", description,
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg"; description?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    // Al ocultarse la página (navegación con Activity) o desmontar, un modal abierto bloquearía todo el documento.
    return () => {
      if (d.open) d.close();
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`a-modal ${size === "sm" ? "a-modal-sm" : size === "lg" ? "a-modal-lg" : ""}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="a-modal-box">
          <div className="a-modal-head">
            <div>
              <h2 id={titleId} className="font-display text-lg font-semibold text-teal-deep">{title}</h2>
              {description && <p className="a-muted text-sm">{description}</p>}
            </div>
            <button type="button" className="btn-icon shrink-0" onClick={onClose} aria-label="Cerrar">
              <IconClose className="size-4" />
            </button>
          </div>
          <div className="a-modal-body">{children}</div>
          {footer && <div className="a-modal-foot">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

/* ---------- Toasts ---------- */
type ToastKind = "ok" | "error";
type ToastItem = { id: number; msg: string; kind: ToastKind };
type Ctx = { toast: (msg: string, kind?: ToastKind) => void; confirm: (o: ConfirmOpts) => Promise<boolean> };
type ConfirmOpts = { title: string; message?: string; confirmLabel?: string; danger?: boolean };

const UiCtx = createContext<Ctx | null>(null);
export const useUi = () => {
  const c = useContext(UiCtx);
  if (!c) throw new Error("UiProvider requerido");
  return c;
};

export function UiProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [conf, setConf] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const seq = useRef(0);

  const toast = useCallback((msg: string, kind: ToastKind = "ok") => {
    const id = ++seq.current;
    setItems((l) => [...l, { id, msg, kind }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), kind === "error" ? 6000 : 3500);
  }, []);
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setConf({ ...o, resolve })), []);
  const cerrar = (v: boolean) => {
    conf?.resolve(v);
    setConf(null);
  };

  return (
    <UiCtx.Provider value={{ toast, confirm }}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="a-toast" data-kind={t.kind}>
            {t.kind === "error" ? <IconAlert className="size-5 shrink-0" /> : <IconCheck className="size-5 shrink-0" />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
      <Modal
        open={!!conf}
        onClose={() => cerrar(false)}
        title={conf?.title ?? ""}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => cerrar(false)}>Cancelar</button>
            <button type="button" className={`btn btn-sm ${conf?.danger ? "btn-danger" : "btn-primary"}`} onClick={() => cerrar(true)} autoFocus>
              {conf?.confirmLabel ?? "Confirmar"}
            </button>
          </>
        }
      >
        <p className="a-muted">{conf?.message}</p>
      </Modal>
    </UiCtx.Provider>
  );
}

/** Ejecuta una acción del servidor: muestra aviso, refresca los datos y devuelve el resultado. */
export function useAct() {
  const router = useRouter();
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  const act = useCallback(
    async <T,>(fn: () => Promise<Result<T>>, okMsg?: string): Promise<Result<T>> => {
      setBusy(true);
      try {
        const r = await fn();
        if (r.ok) {
          if (okMsg) toast(okMsg);
          router.refresh();
        } else toast(r.error, "error");
        return r;
      } catch {
        toast("No se pudo completar la acción. Revisa tu conexión.", "error");
        return { ok: false, error: "red" };
      } finally {
        setBusy(false);
      }
    },
    [router, toast],
  );
  return { act, busy };
}

/* ---------- Chips y etiquetas ---------- */
export const ETIQUETAS: Record<string, string> = {
  nueva: "Nueva", aceptada: "Aceptada", reprogramada: "Reprogramada", rechazada: "Rechazada",
  pendiente: "Pendiente", confirmada: "Confirmada", atendida: "Atendida", cancelada: "Cancelada", no_asistio: "No asistió",
  activo: "Activo", alta: "De alta", inactivo: "Inactivo", completado: "Completado", pausado: "Pausado",
};
export function Estado({ valor }: { valor: string }) {
  return <span className={`st st-${valor}`}>{ETIQUETAS[valor] ?? valor}</span>;
}

/* ---------- Campos ---------- */
export function Campo({ label, hint, children, className = "", htmlFor }: { label: string; hint?: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={className}>
      <label className="a-label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="a-hint">{hint}</p>}
    </div>
  );
}

/* ---------- Estados vacíos ---------- */
export function Vacio({ titulo, texto, children }: { titulo: string; texto?: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <svg viewBox="0 0 120 90" className="mb-4 h-24 w-auto" aria-hidden="true">
        <ellipse cx="60" cy="80" rx="38" ry="5" fill="#1b7f8e" opacity=".12" />
        <rect x="26" y="22" width="68" height="50" rx="12" fill="#e6f3ef" stroke="#1b7f8e" strokeOpacity=".35" strokeWidth="2" />
        <path d="M40 40h40M40 50h26" stroke="#1b7f8e" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
        <circle cx="92" cy="26" r="11" fill="#8bb93e" opacity=".9" className="art-float" />
        <path d="M87 26l4 4 7-8" stroke="#fff" strokeWidth="2.500" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-display text-base font-semibold text-teal-deep">{titulo}</p>
      {texto && <p className="a-muted mt-1 max-w-sm text-sm">{texto}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
