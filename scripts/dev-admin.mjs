// Servidor de desarrollo propio del panel (puerto 3101, carpeta de build aparte para no chocar con el de la landing).
import { spawn } from "node:child_process";
const env = { ...process.env, NEXT_DIST_DIR: ".next-admin" };
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3101"], { stdio: "inherit", env });
child.on("exit", (c) => process.exit(c ?? 0));
