// Hash de contraseñas con scrypt (node:crypto). Formato: scrypt$<sal hex>$<hash hex>
import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashClave(clave: string): string {
  const sal = randomBytes(16);
  return `scrypt$${sal.toString("hex")}$${scryptSync(clave, sal, 64).toString("hex")}`;
}

export function verificarClave(clave: string, guardado: string): boolean {
  const [alg, sal, hash] = guardado.split("$");
  if (alg !== "scrypt" || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "hex");
  const real = scryptSync(clave, Buffer.from(sal, "hex"), esperado.length);
  return real.length === esperado.length && timingSafeEqual(real, esperado);
}
