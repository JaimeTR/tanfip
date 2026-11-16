export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
/** true cuando hay un proyecto Supabase configurado; si no, el admin usa datos locales en memoria. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
/** El modo local con usuarios demo no se permite en producción salvo que se pida explícitamente. */
export const demoAllowed = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_ADMIN === "true";
