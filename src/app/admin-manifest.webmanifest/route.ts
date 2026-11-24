// Manifest del panel: permite instalarlo como app propia ("TANFIP Panel") y abrir directo en /admin.
// Está fuera de /admin a propósito: el proxy del panel redirige al login y el navegador pide el manifest sin sesión.
export function GET() {
  return Response.json(
    {
      name: "TANFIP · Panel",
      short_name: "TANFIP Panel",
      description: "Agenda, pacientes y solicitudes de TANFIP.",
      start_url: "/admin",
      scope: "/admin",
      display: "standalone",
      orientation: "portrait",
      background_color: "#f7fbf8",
      theme_color: "#1b7f8e",
      lang: "es",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
      shortcuts: [
        { name: "Citas", url: "/admin/citas" },
        { name: "Solicitudes", url: "/admin/solicitudes" },
        { name: "Recordatorios", url: "/admin/recordatorios" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
