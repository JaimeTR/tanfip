/** true cuando hay una base Neon configurada (DATABASE_URL). Tiene prioridad sobre el modo local en memoria. */
export const neonUrl = process.env.DATABASE_URL;
export const neonConfigured = Boolean(neonUrl);
