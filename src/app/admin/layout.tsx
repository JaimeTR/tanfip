import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel TANFIP" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#1b7f8e", width: "device-width", initialScale: 1 };

function Cargando() {
  return (
    <div className="adm-main" aria-busy="true" aria-label="Cargando">
      <div className="a-skeleton mb-4 h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="a-skeleton h-28" />)}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <Suspense fallback={<Cargando />}>{children}</Suspense>
    </div>
  );
}
