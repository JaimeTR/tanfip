import fs from "node:fs";
import path from "node:path";

const EXT = ["jpg", "jpeg", "webp", "png", "avif"];

/** Devuelve la ruta pública de /public/photos/<name>.<ext> si el archivo existe. */
export function photo(name: string): string | null {
  for (const e of EXT) {
    if (fs.existsSync(path.join(process.cwd(), "public", "photos", `${name}.${e}`))) {
      return `/photos/${name}.${e}`;
    }
  }
  return null;
}
