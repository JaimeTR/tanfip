// Íconos animados. Las animaciones se activan al pasar el cursor sobre un contenedor `.hov`
// y el trazo se dibuja al entrar en pantalla (dentro de un <Reveal>).
type P = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconHeart = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-beat ${className}`}>
    <path d="M12 21s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.6C19.500 16.400 12 21 12 21Z" />
  </svg>
);

export const IconPilates = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-sway ${className}`}>
    <circle cx="12" cy="4.800" r="2.200" />
    <path d="M4 21c1.200-5.200 3.600-8 8-8s6.800 2.800 8 8" />
    <path d="M6.500 11.500C9 10.500 10.500 8.500 12 6c1.500 2.500 3 4.500 5.500 5.500" />
  </svg>
);

export const IconCalendar = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-bounce ${className}`}>
    <rect x="3.500" y="5" width="17" height="15.500" rx="3" />
    <path d="M8 3v4M16 3v4M3.500 10h17" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

export const IconClipboard = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-bounce ${className}`}>
    <rect x="5" y="4.500" width="14" height="17" rx="3" />
    <path d="M9 4.500h6v2.500H9zM9 12h6M9 16h4" />
  </svg>
);

export const IconLeaf = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-sway ${className}`}>
    <path d="M5 19C4 10 9 4.500 20 4c.500 10-4.500 16-13 15" />
    <path d="M5 19c3-5 6-8 10-10" />
  </svg>
);

export const IconShield = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-beat ${className}`}>
    <path d="M12 3 5 6v5.500c0 4.500 3 8 7 9.500 4-1.500 7-5 7-9.500V6l-7-3Z" />
    <path d="m9 12 2.200 2.200L15 10.200" />
  </svg>
);

export const IconClock = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-spin ${className}`}>
    <circle cx="12" cy="12" r="8.500" />
    <path d="M12 7.500V12l3 2" />
  </svg>
);

export const IconChat = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-bounce ${className}`}>
    <path d="M4 5.500A2.500 2.500 0 0 1 6.500 3h11A2.500 2.500 0 0 1 20 5.500v8a2.500 2.500 0 0 1-2.500 2.500H10l-4.500 4v-4A2.500 2.500 0 0 1 4 13.500v-8Z" />
    <path d="M8.500 8.500h7M8.500 11.500h4" />
  </svg>
);

export const IconArrow = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico-arrow ${className}`}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconCheck = ({ className = "size-5" }: P) => (
  <svg {...base} strokeWidth={2.4} className={`ico-check ${className}`}>
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </svg>
);

export const IconPhone = ({ className = "size-6" }: P) => (
  <svg {...base} className={`ico ico-draw ico-bounce ${className}`}>
    <rect x="7" y="2.500" width="10" height="19" rx="2.800" />
    <path d="M11 18.500h2" />
  </svg>
);

export const IconUser = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico ${className}`}>
    <circle cx="12" cy="8" r="3.800" />
    <path d="M4.500 20.500c.8-4 3.500-6 7.500-6s6.700 2 7.500 6" />
  </svg>
);

export const IconMail = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico ${className}`}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7.500 8 5.500 8-5.500" />
  </svg>
);

export const IconPin = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico ${className}`}>
    <path d="M12 21s-6.500-5.800-6.500-11a6.500 6.500 0 0 1 13 0c0 5.200-6.500 11-6.500 11Z" />
    <circle cx="12" cy="10" r="2.400" />
  </svg>
);

export const IconArrowLeft = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico-arrow-left ${className}`}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconLock = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico ${className}`}>
    <rect x="5" y="10.500" width="14" height="10" rx="3" />
    <path d="M8 10.500V8a4 4 0 0 1 8 0v2.500" />
  </svg>
);

export const IconId = ({ className = "size-5" }: P) => (
  <svg {...base} className={`ico ${className}`}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <circle cx="9" cy="11" r="2" />
    <path d="M6.500 16c.5-1.600 1.500-2.300 2.500-2.300s2 .7 2.500 2.300M14 10h4M14 13.500h3" />
  </svg>
);
