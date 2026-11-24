import type { Metadata, Viewport } from "next";
import { Cinzel, Montserrat, Allura } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";
import { site } from "@/lib/site";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "600", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const allura = Allura({ variable: "--font-allura", subsets: ["latin"], weight: "400" });

const title = "Tania Castro · Fisioterapia y Pilates en Mat | TANFIP";
const description =
  "Fisioterapia, rehabilitación y Pilates en Mat personalizados con Tania Castro. Alivia el dolor de espalda, mejora tu postura y agenda tu cita en línea.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s · TANFIP" },
  description,
  applicationName: "TANFIP",
  keywords: [
    "fisioterapia",
    "pilates en mat",
    "pilates",
    "fisioterapeuta",
    "Tania Castro",
    "rehabilitación",
    "dolor de espalda",
    "terapia física",
    "agendar cita fisioterapia",
    "plan personalizado",
    "fisioterapia y pilates",
    "mejorar postura",
  ],
  authors: [{ name: "Tania Castro" }],
  creator: "Tania Castro",
  category: "health",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TANFIP", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "/",
    siteName: "TANFIP",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  formatDetection: { telephone: true },
  // Señales geográficas (la ciudad y las coordenadas se añaden solo si están definidas en site.ts).
  other: {
    "geo.region": site.region ? `${site.country}-${site.region}` : site.country,
    ...(site.city ? { "geo.placename": site.city } : {}),
    ...(site.lat && site.lng ? { "geo.position": `${site.lat};${site.lng}`, ICBM: `${site.lat}, ${site.lng}` } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#1b7f8e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${cinzel.variable} ${montserrat.variable} ${allura.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}.ico-draw path,.ico-draw circle,.ico-draw rect{stroke-dashoffset:0!important}`}</style>
        </noscript>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
