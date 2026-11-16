import fs from "node:fs";
import path from "node:path";
import { PhotoSlider, type Slide } from "./PhotoSlider";

/**
 * Slider de fotos. Para agregar fotos propias basta con copiar archivos
 * `cliente-1.jpg`, `cliente-2.webp`, … a `public/photos` (aparecen primero y solas).
 */
const base: Slide[] = [
  { src: "/photos/terapia-1.webp", alt: "Fisioterapeuta tratando a un paciente" },
  { src: "/photos/galeria-1.webp", alt: "Sesión de Pilates en mat en un estudio" },
  { src: "/photos/terapia-2.webp", alt: "Rehabilitación con banda elástica" },
  { src: "/photos/galeria-3.webp", alt: "Clase de Pilates en una terraza" },
  { src: "/photos/galeria-7.webp", alt: "Terapia en camilla de rehabilitación" },
  { src: "/photos/galeria-2.webp", alt: "Ejercicio de Pilates con banda elástica" },
  { src: "/photos/pilates-1.webp", alt: "Instructora de Pilates en mat" },
  { src: "/photos/galeria-5.webp", alt: "Estudio de Pilates con equipos reformer" },
  { src: "/photos/galeria-4.webp", alt: "Pilates al aire libre sobre colchonetas" },
  { src: "/photos/galeria-6.webp", alt: "Ejercicio de Pilates en cuatro apoyos" },
];

function clientPhotos(): Slide[] {
  const dir = path.join(process.cwd(), "public", "photos");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /^cliente-.+\.(jpe?g|webp|png|avif)$/i.test(f));
  } catch {
    /* sin carpeta: se usan las demás */
  }
  return files
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => ({ src: `/photos/${f}`, alt: "Paciente de TANFIP durante su sesión" }));
}

export function ClientGallery() {
  return <PhotoSlider slides={[...clientPhotos(), ...base]} />;
}
