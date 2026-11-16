// Ilustraciones vectoriales en los colores de la marca. Sirven como imágenes de sección
// hasta contar con fotos reales (ver README en /public/photos si se agregan).

const defs = (id: string) => (
  <defs>
    <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#e6f3ef" />
      <stop offset="1" stopColor="#dcebc4" />
    </linearGradient>
    <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#1b7f8e" />
      <stop offset="1" stopColor="#14606e" />
    </linearGradient>
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#8bb93e" />
      <stop offset="1" stopColor="#5f9a3a" />
    </linearGradient>
  </defs>
);

/** Pilates en mat: figura en posición "teaser" sobre la colchoneta. */
export function ArtPilates({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de una persona practicando Pilates en mat" className={className}>
      {defs("pl")}
      <rect width="480" height="360" fill="url(#pl-bg)" />
      <circle cx="400" cy="70" r="120" fill="#fff" opacity=".35" />
      <circle cx="60" cy="320" r="130" fill="#8bb93e" opacity=".18" />
      <g className="art-float">
        <circle cx="86" cy="86" r="10" fill="#8bb93e" opacity=".7" />
        <circle cx="420" cy="214" r="7" fill="#1b7f8e" opacity=".5" />
        <circle cx="330" cy="58" r="5" fill="#8bb93e" opacity=".8" />
      </g>
      {/* colchoneta */}
      <rect x="54" y="272" width="372" height="28" rx="14" fill="url(#pl-t)" opacity=".92" />
      <rect x="70" y="278" width="340" height="5" rx="2.500" fill="#fff" opacity=".25" />
      {/* figura */}
      <g className="art-breathe" strokeLinecap="round">
        <path d="M232 262 354 170" stroke="url(#pl-t)" strokeWidth="26" fill="none" />
        <path d="M232 262 162 176" stroke="url(#pl-g)" strokeWidth="28" fill="none" />
        <path d="M168 188 300 146" stroke="#8bb93e" strokeWidth="12" fill="none" opacity=".9" />
        <circle cx="146" cy="142" r="18" fill="#14606e" />
        <path d="M352 168 372 158" stroke="#14606e" strokeWidth="10" fill="none" />
      </g>
      {/* aro de pilates */}
      <g className="art-spin" style={{ transformOrigin: "398px 134px" }}>
        <circle cx="398" cy="134" r="30" fill="none" stroke="#8bb93e" strokeWidth="6" strokeDasharray="120 70" />
      </g>
    </svg>
  );
}

/** Fisioterapia: sesión sobre camilla con zona de tratamiento resaltada. */
export function ArtPhysio({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de una sesión de fisioterapia" className={className}>
      {defs("fs")}
      <rect width="480" height="360" fill="url(#fs-bg)" />
      <circle cx="80" cy="60" r="110" fill="#fff" opacity=".4" />
      <circle cx="430" cy="300" r="120" fill="#1b7f8e" opacity=".12" />
      {/* camilla */}
      <rect x="60" y="236" width="360" height="26" rx="13" fill="#fff" />
      <rect x="60" y="236" width="360" height="26" rx="13" fill="none" stroke="#1b7f8e" strokeOpacity=".25" />
      <path d="M110 262v62M370 262v62M90 324h40M350 324h40" stroke="#14606e" strokeWidth="8" strokeLinecap="round" />
      {/* paciente */}
      <circle cx="98" cy="214" r="19" fill="#14606e" />
      <path d="M120 226h250" stroke="url(#fs-t)" strokeWidth="26" strokeLinecap="round" />
      <path d="M370 226h46" stroke="url(#fs-g)" strokeWidth="22" strokeLinecap="round" />
      {/* terapeuta */}
      <circle cx="250" cy="82" r="20" fill="#14606e" />
      <path d="M222 118c0-14 56-14 56 0v70h-56z" fill="url(#fs-g)" />
      <path d="M236 150 222 206M264 150l14 56" stroke="url(#fs-g)" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* zona tratada */}
      <g style={{ transformOrigin: "250px 212px" }}>
        <circle cx="250" cy="212" r="12" fill="#8bb93e" />
        <circle className="art-pulse" cx="250" cy="212" r="12" fill="none" stroke="#8bb93e" strokeWidth="3" />
        <circle className="art-pulse art-pulse-2" cx="250" cy="212" r="12" fill="none" stroke="#1b7f8e" strokeWidth="2" />
      </g>
      <g className="art-float">
        <path d="M388 90v28M374 104h28" stroke="#1b7f8e" strokeWidth="7" strokeLinecap="round" />
        <circle cx="80" cy="150" r="7" fill="#8bb93e" />
      </g>
    </svg>
  );
}

/** Columna vertebral animada (postura / espalda). */
export function ArtSpine({ className = "" }: { className?: string }) {
  const dots = Array.from({ length: 12 }, (_, i) => i);
  return (
    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de la columna vertebral" className={className}>
      {defs("sp")}
      <rect width="480" height="360" fill="url(#sp-bg)" />
      <circle cx="240" cy="180" r="150" fill="#fff" opacity=".45" />
      <g className="art-spin-slow" style={{ transformOrigin: "240px 180px" }}>
        <circle cx="240" cy="180" r="128" fill="none" stroke="#1b7f8e" strokeOpacity=".35" strokeWidth="2" strokeDasharray="4 10" />
      </g>
      <g>
        {dots.map((i) => {
          const y = 52 + i * 22;
          const x = 240 + Math.sin(i * 0.55) * 16;
          const w = 22 + Math.sin((i / 11) * Math.PI) * 26;
          return (
            <rect
              key={i}
              className="art-vertebra"
              style={{ animationDelay: `${i * 0.18}s`, transformOrigin: `${x}px ${y}px` }}
              x={x - w / 2}
              y={y - 8}
              width={w}
              height="16"
              rx="8"
              fill={i % 2 ? "url(#sp-t)" : "url(#sp-g)"}
            />
          );
        })}
      </g>
      <circle className="art-pulse" cx="240" cy="228" r="10" fill="none" stroke="#8bb93e" strokeWidth="3" />
      <circle cx="240" cy="228" r="6" fill="#8bb93e" />
    </svg>
  );
}

/** Accesorios de Pilates: aro, pelota y colchoneta. */
export function ArtRings({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de accesorios de Pilates" className={className}>
      {defs("rg")}
      <rect width="480" height="360" fill="url(#rg-bg)" />
      <circle cx="90" cy="60" r="110" fill="#fff" opacity=".4" />
      <rect x="60" y="270" width="360" height="26" rx="13" fill="url(#rg-t)" />
      <g className="art-float">
        <circle cx="150" cy="210" r="62" fill="url(#rg-g)" />
        <path d="M110 190c30-14 70-14 100 0" stroke="#fff" strokeOpacity=".45" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      <g className="art-spin" style={{ transformOrigin: "320px 170px" }}>
        <circle cx="320" cy="170" r="74" fill="none" stroke="url(#rg-t)" strokeWidth="14" strokeDasharray="330 140" strokeLinecap="round" />
      </g>
      <circle cx="320" cy="170" r="42" fill="none" stroke="#8bb93e" strokeWidth="6" strokeOpacity=".7" />
    </svg>
  );
}

/** Fondo animado del hero: formas orgánicas, aros y línea de pulso. */
export function HeroBackdrop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="hb-t" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b7f8e" />
          <stop offset="1" stopColor="#14606e" />
        </linearGradient>
        <linearGradient id="hb-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8bb93e" />
          <stop offset="1" stopColor="#5f9a3a" />
        </linearGradient>
      </defs>
      <g className="hb-blob hb-a">
        <path d="M1180 60c120-30 250 40 250 170s-110 190-230 160-190-120-120-210c20-60 50-100 100-120Z" fill="url(#hb-g)" opacity=".22" />
      </g>
      <g className="hb-blob hb-b">
        <path d="M-40 420c110-70 260-40 300 70s-40 220-170 220S-130 560-40 420Z" fill="url(#hb-t)" opacity=".16" />
      </g>
      {/* línea de pulso */}
      <path
        className="hb-ekg"
        d="M0 600H300l24-70 34 130 28-90 18 30H760l24-52 30 100 24-60 14 22H1440"
        fill="none"
        stroke="#1b7f8e"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".35"
      />
      <g className="art-float">
        <circle cx="620" cy="90" r="9" fill="#8bb93e" opacity=".7" />
        <circle cx="880" cy="560" r="7" fill="#1b7f8e" opacity=".5" />
        <circle cx="140" cy="130" r="6" fill="#8bb93e" opacity=".8" />
      </g>
    </svg>
  );
}

/** Retrato de marca: isotipo dentro de anillos animados. */
export function ArtBrand({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Isotipo TANFIP" className={className}>
      {defs("br")}
      <rect width="400" height="400" fill="url(#br-bg)" />
      <g className="art-spin-slow" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="170" fill="none" stroke="#1b7f8e" strokeOpacity=".35" strokeWidth="2" strokeDasharray="6 12" />
      </g>
      <g className="art-spin-rev" style={{ transformOrigin: "200px 200px" }}>
        <circle cx="200" cy="200" r="140" fill="none" stroke="#8bb93e" strokeOpacity=".55" strokeWidth="3" strokeDasharray="60 24" />
      </g>
      <circle cx="200" cy="200" r="104" fill="#fff" opacity=".8" />
      <image href="/brand/isotipo-color.svg" x="110" y="110" width="180" height="180" />
    </svg>
  );
}
