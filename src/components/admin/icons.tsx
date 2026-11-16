// Íconos propios del panel (los de la landing se importan desde "@/components/Icons").
// Se animan al pasar el cursor sobre un contenedor `.hov` o un `.side-link`.
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
const mk = (anim: string, children: React.ReactNode, def = "size-5") =>
  function Icon({ className = def }: P) {
    return (
      <svg {...base} className={`ico ${anim} ${className}`}>
        {children}
      </svg>
    );
  };

export const IconHome = mk("ico-bounce", <><path d="M3.500 11 12 4l8.500 7" /><path d="M5.500 9.500V20h13V9.500" /><path d="M10 20v-5h4v5" /></>);
export const IconInbox = mk("ico-bounce", <><path d="M3 13h5l1.500 3h5l1.500-3h5" /><path d="M5.500 5h13L21 13v6H3v-6Z" /></>);
export const IconUsers = mk("ico-sway", <><circle cx="9" cy="8" r="3.200" /><path d="M3 20c.5-3.600 2.800-5.500 6-5.500s5.500 1.900 6 5.500" /><path d="M16 5a3 3 0 0 1 0 6M17.500 14.800c2 .6 3.200 2.300 3.500 5.200" /></>);
export const IconFolder = mk("ico-bounce", <path d="M3 7a2 2 0 0 1 2-2h4l2 2.500h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />);
export const IconSliders = mk("ico-sway", <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>);
export const IconGlobe = mk("ico-spin", <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.800 2.800 2.800 15.200 0 18M12 3c-2.800 2.800-2.800 15.200 0 18" /></>);
export const IconLogout = mk("ico-bounce", <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 8l-4 4 4 4M6 12h10" /></>);
export const IconSearch = mk("ico-sway", <><circle cx="11" cy="11" r="6.500" /><path d="m16 16 4.500 4.500" /></>);
export const IconPlus = mk("ico-spin", <path d="M12 5v14M5 12h14" />);
export const IconEdit = mk("ico-sway", <><path d="M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16Z" /><path d="m13.500 6.500 4 4" /></>);
export const IconTrash = mk("ico-bounce", <><path d="M4 7h16M9 7V4.500h6V7M6.500 7l1 13h9l1-13" /><path d="M10 11v6M14 11v6" /></>);
export const IconClose = mk("ico-spin", <path d="M6 6l12 12M18 6 6 18" />);
export const IconMenu = mk("", <path d="M4 7h16M4 12h16M4 17h16" />, "size-6");
export const IconChevronLeft = mk("", <path d="m15 6-6 6 6 6" />);
export const IconChevronRight = mk("", <path d="m9 6 6 6-6 6" />);
export const IconSortUp = mk("", <path d="m7 14 5-5 5 5" />, "size-4");
export const IconSortDown = mk("", <path d="m7 10 5 5 5-5" />, "size-4");
export const IconWhatsapp = mk("ico-beat", <><path d="M4 20l1.200-4.200A8 8 0 1 1 8.300 19Z" /><path d="M9 9.500c.3 2.200 2.300 4.200 4.500 4.500l1.300-1.200-2-1-.8.700c-.9-.4-1.700-1.200-2.100-2.100l.7-.8-1-2Z" /></>);
export const IconChart = mk("ico-bounce", <><path d="M4 20V5M4 20h16" /><path d="M8 16v-4M12.500 16V8M17 16v-6" /></>);
export const IconAlert = mk("ico-beat", <><path d="M12 4 2.800 19.500h18.400Z" /><path d="M12 10v4.500M12 17.200v.1" /></>);
export const IconPin = mk("ico-bounce", <><path d="M9 4h6l-1 5 3 3v1.500H7V12l3-3Z" /><path d="M12 13.500V20" /></>);
export const IconClipboardCheck = mk("ico-bounce", <><rect x="5" y="4.500" width="14" height="16" rx="2" /><path d="M9 4.500V3h6v1.500M8.500 13l2.500 2.500 4.500-5" /></>);
export const IconEye = mk("ico-beat", <><path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12Z" /><circle cx="12" cy="12" r="2.800" /></>);
export const IconDownload = mk("ico-bounce", <><path d="M12 4v11M7.500 11 12 15.500 16.500 11" /><path d="M4 19.500h16" /></>);
export const IconRefresh = mk("ico-spin", <><path d="M20 12a8 8 0 0 1-14 5.300M4 12A8 8 0 0 1 18 6.700" /><path d="M18 3v4h-4M6 21v-4h4" /></>);
export const IconKey = mk("ico-sway", <><circle cx="8" cy="15" r="4" /><path d="m11 12 8.500-8.500M16 7l2.500 2.500" /></>);
export const IconNote = mk("ico-sway", <><path d="M6 3.500h9l4 4V20.500H6Z" /><path d="M15 3.500V8h4M9 12.500h7M9 16h7" /></>);
export const IconTarget = mk("ico-spin", <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".8" /></>);
export const IconSparkle = mk("ico-spin", <path d="M12 3c.6 4.500 2.500 6.400 7 7-4.500.6-6.400 2.500-7 7-.6-4.500-2.500-6.400-7-7 4.500-.6 6.400-2.500 7-7Z" />);
export const IconUser2 = mk("ico-sway", <><circle cx="12" cy="8" r="3.500" /><path d="M5 20c.8-4 3.500-6 7-6s6.200 2 7 6" /></>);
