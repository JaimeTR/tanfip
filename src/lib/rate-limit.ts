// Límite simple por clave en memoria del proceso (suficiente como freno básico; no sustituye a un WAF).
const hits = new Map<string, number[]>();

export function limitar(clave: string, max: number, ventanaMs: number): boolean {
  const ahora = Date.now();
  const recientes = (hits.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  if (recientes.length >= max) {
    hits.set(clave, recientes);
    return false;
  }
  recientes.push(ahora);
  hits.set(clave, recientes);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => ahora - t < ventanaMs)) hits.delete(k);
  return true;
}
