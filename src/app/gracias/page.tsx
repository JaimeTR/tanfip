import type { Metadata } from "next";
import { GraciasView } from "@/components/GraciasView";

export const metadata: Metadata = {
  title: "¡Gracias! Solicitud enviada",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return <GraciasView />;
}
