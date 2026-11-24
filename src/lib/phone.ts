// Teléfonos: seguro para cliente y servidor.
// En Perú los celulares tienen 9 dígitos y empiezan con 9, sin "0" delante. Quien escribe "0949 809 459" o "+51 949 809 459"
// obtiene siempre "949809459". Los números de otro país se guardan con "+" y su código.
const PAIS = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || "51";

/** Forma canónica: nacional sin ceros ni código ("949809459") o internacional con "+" ("+593991234567"). */
export function normalizarTelefono(tel: string): string {
  const raw = (tel ?? "").trim();
  let d = raw.replace(/\D/g, "");
  const intl = raw.startsWith("+") || raw.startsWith("00");
  if (raw.startsWith("00")) d = d.slice(2);
  if (intl && !d.startsWith(PAIS)) return d ? `+${d}` : "";
  d = d.replace(/^0+/, "");
  // "51949809459" o "+51 949..." → nacional (solo si queda un número completo detrás del código)
  if ((intl || d.length > 9) && d.startsWith(PAIS) && d.length - PAIS.length >= 8) d = d.slice(PAIS.length).replace(/^0+/, "");
  return d;
}

/** Para escribir en un campo: quita ceros iniciales mientras se teclea, sin tocar espacios ni "+". */
export const limpiarTelefonoInput = (v: string) => (v.trim().startsWith("+") ? v : v.replace(/^[\s0]+/, ""));

/** Dígitos con código de país, listos para wa.me (949809459 → 51949809459). */
export function telefonoWa(tel: string): string {
  const n = normalizarTelefono(tel);
  return n.startsWith("+") ? n.slice(1) : n ? PAIS + n : "";
}

/** Para mostrar: "949 809 459" (nacional de 9 dígitos), el resto tal cual. */
export function formatoTelefono(tel: string): string {
  const n = normalizarTelefono(tel);
  return /^\d{9}$/.test(n) ? n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3") : n || tel;
}
