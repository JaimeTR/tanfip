import Image from "next/image";
import { photo } from "@/lib/photos";

/**
 * Ranura de imagen: usa /public/photos/<name>.(jpg|webp|png) si existe;
 * si no, muestra la ilustración vectorial de respaldo.
 * `position` enfoca el encuadre (object-position) y `tint` aplica el tono de marca.
 */
export function Slot({
  name,
  alt,
  fallback,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  position = "center",
  tint = true,
}: {
  name: string;
  alt: string;
  fallback: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  position?: string;
  tint?: boolean;
}) {
  const src = photo(name);
  if (!src) return <>{fallback}</>;
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectPosition: position }}
        className="object-cover saturate-[.92] transition-transform duration-[1200ms] ease-out group-hover/tile:scale-105"
      />
      {tint && <div className="brand-tint" aria-hidden="true" />}
    </>
  );
}
