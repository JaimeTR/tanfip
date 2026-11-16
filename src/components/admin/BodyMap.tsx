"use client";
// Muñeco para marcar zonas de dolor (misma idea y coordenadas que el formulario de la web).
const ZONAS: { name: string; pts: [number, number][] }[] = [
  { name: "Cuello", pts: [[70, 50]] },
  { name: "Hombro", pts: [[42, 66], [98, 66]] },
  { name: "Brazo / Codo", pts: [[30, 104], [110, 104]] },
  { name: "Muñeca / Mano", pts: [[22, 158], [118, 158]] },
  { name: "Espalda alta", pts: [[70, 88]] },
  { name: "Espalda baja / Lumbar", pts: [[70, 126]] },
  { name: "Cadera", pts: [[52, 156], [88, 156]] },
  { name: "Muslo / Rodilla", pts: [[58, 206], [82, 206]] },
  { name: "Pierna / Tobillo", pts: [[56, 248], [84, 248]] },
  { name: "Pie", pts: [[54, 283], [86, 283]] },
];

export function BodyMap({ value, onChange, className = "h-64" }: { value: string[]; onChange?: (v: string[]) => void; className?: string }) {
  const toggle = (z: string) => onChange?.(value.includes(z) ? value.filter((x) => x !== z) : [...value, z]);
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[9rem_1fr]">
      <svg viewBox="0 0 140 300" className={`mx-auto w-auto drop-shadow-sm ${className}`} role="img" aria-label={value.length ? `Zonas marcadas: ${value.join(", ")}` : "Muñeco sin zonas marcadas"}>
        <g fill="none" stroke="#cfe6e3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="70" cy="26" r="17" fill="#cfe6e3" stroke="none" />
          <path d="M70 43v14" strokeWidth="14" />
          <path d="M44 66h52" strokeWidth="14" />
          <rect x="46" y="60" width="48" height="104" rx="22" fill="#cfe6e3" stroke="none" />
          <path d="M42 68 28 108 22 158 20 178M98 68l14 40 6 50 2 20" strokeWidth="13" />
          <path d="M56 160l2 56-2 46-2 30M84 160l-2 56 2 46 2 30" strokeWidth="19" />
        </g>
        {ZONAS.map((z) => {
          const on = value.includes(z.name);
          return (
            <g key={z.name} onClick={() => toggle(z.name)} className={onChange ? "zone-dot" : ""} aria-hidden="true">
              {z.pts.map(([cx, cy], i) => (
                <g key={i}>
                  {on && <circle className="art-pulse" cx={cx} cy={cy} r="8" fill="none" stroke="#8bb93e" strokeWidth="2.5" />}
                  <circle cx={cx} cy={cy} r={on ? 8 : 6} fill={on ? "#5f9a3a" : "#1b7f8e"} fillOpacity={on ? 0.95 : onChange ? 0.28 : 0.1} stroke="#fff" strokeWidth="1.5" />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-2">
        {ZONAS.map((z) =>
          onChange ? (
            <button type="button" key={z.name} aria-pressed={value.includes(z.name)} onClick={() => toggle(z.name)} className="chip rounded-full border-2 border-teal/15 bg-white px-3 py-1.5 text-xs font-medium">
              {z.name}
            </button>
          ) : value.includes(z.name) ? (
            <span key={z.name} className="st st-aceptada">{z.name}</span>
          ) : null,
        )}
        {!onChange && value.length === 0 && <p className="text-sm text-muted">Sin zonas registradas.</p>}
      </div>
    </div>
  );
}
