// Genera la familia de logos TANFIP en SVG (texto convertido a trazos) y PNG.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import opentype from "opentype.js";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const fontFile = (pkg, f) =>
  require.resolve(`@fontsource/${pkg}/files/${f}`);
const load = (pkg, f) => {
  const b = fs.readFileSync(fontFile(pkg, f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const cinzel = load("cinzel", "cinzel-latin-600-normal.woff");
const montserrat = load("montserrat", "montserrat-latin-500-normal.woff");
const allura = load("allura", "allura-latin-400-normal.woff");

const C = {
  teal: "#1B7F8E",
  tealDeep: "#14606E",
  green: "#8BB93E",
  greenDeep: "#5F9A3A",
  olive: "#86A33A",
  script: "#1A5566",
};

// ---------- texto a trazos ----------
function textPath(font, text, size, tracking = 0) {
  let x = 0;
  const parts = [];
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    const p = g.getPath(x, 0, size);
    const n = (v) => (Math.round(v * 100) / 100).toString();
    const d = p.commands
      .map((c) => {
        if (c.type === "M" || c.type === "L") return `${c.type}${n(c.x)} ${n(c.y)}`;
        if (c.type === "Q") return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        if (c.type === "C") return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        return "Z";
      })
      .join("");
    parts.push(d);
    x += (g.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return { d: parts.join(" "), width: x - tracking };
}

// ---------- isotipo (viewBox 0 0 200 200) ----------
const S = (t) => {
  // curva S de la columna: dos cúbicas
  const seg = (p0, p1, p2, p3, u) => {
    const v = 1 - u;
    return [
      v ** 3 * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u ** 3 * p3[0],
      v ** 3 * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u ** 3 * p3[1],
    ];
  };
  const A = [[106, 18], [84, 52], [120, 82], [101, 108]];
  const B = [[101, 108], [82, 134], [114, 156], [97, 184]];
  return t < 0.5 ? seg(...A, t * 2) : seg(...B, (t - 0.5) * 2);
};

function spineGeometry() {
  const N = 80;
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(S(i / N));
  const normals = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(N, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  });
  // cinta afilada
  const w = (i) => 1.2 + 4.6 * Math.sin((Math.PI * i) / N);
  const left = pts.map((p, i) => [p[0] + normals[i][0] * w(i), p[1] + normals[i][1] * w(i)]);
  const right = pts.map((p, i) => [p[0] - normals[i][0] * w(i), p[1] - normals[i][1] * w(i)]).reverse();
  const ribbon =
    "M" + [...left, ...right].map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" L") + "Z";
  // vértebras: puntos a la izquierda de la cinta
  const dots = [];
  for (let k = 0; k < 9; k++) {
    const i = Math.round(8 + (k * (N * 0.56 - 8)) / 8);
    const t = k / 8;
    const r = 1.7 + 2.0 * Math.sin(Math.PI * t);
    const off = 12;
    dots.push([pts[i][0] + normals[i][0] * off, pts[i][1] + normals[i][1] * off, r]);
  }
  return { ribbon, dots };
}
const spine = spineGeometry();

/** Devuelve el contenido SVG del isotipo. colors: {a: teal, b: green, c: teal profundo} */
function markInner(id, col) {
  const { a, b, c } = col;
  return `
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${col.b2 ?? b}"/>
    </linearGradient>
    <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${c}"/>
    </linearGradient>
  </defs>
  <!-- aro -->
  <path d="M93.9 30.3 A70 70 0 0 0 81.9 167.6" fill="none" stroke="url(#${id}t)" stroke-width="6.5" stroke-linecap="round"/>
  <path d="M118.1 32.4 A70 70 0 0 1 118.1 167.6" fill="none" stroke="url(#${id}g)" stroke-width="6.5" stroke-linecap="round"/>
  <!-- aros de pilates -->
  <rect x="22" y="81" width="15" height="38" rx="7.5" fill="url(#${id}g)"/>
  <path d="M24 94h11M24 100h11M24 106h11" stroke="${col.bg ?? "#fff"}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
  <rect x="163" y="81" width="15" height="38" rx="7.5" fill="url(#${id}g)"/>
  <path d="M165 94h11M165 100h11M165 106h11" stroke="${col.bg ?? "#fff"}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
  <!-- columna -->
  <path d="${spine.ribbon}" fill="url(#${id}t)"/>
  ${spine.dots.map((d) => `<circle cx="${d[0].toFixed(1)}" cy="${d[1].toFixed(1)}" r="${d[2].toFixed(1)}" fill="${a}"/>`).join("")}
  <!-- figura -->
  <circle cx="127" cy="58" r="9" fill="${a}"/>
  <path d="M112 98C126 92 140 78 156 58C152 80 136 100 112 98Z" fill="url(#${id}g)"/>
  <path d="M99 122C76 120 56 130 62 143C68 153 86 148 97 151" fill="none" stroke="url(#${id}t)" stroke-width="5" stroke-linecap="round"/>
  <path d="M72 162C84 154 100 156 110 165C96 170 80 170 72 162Z" fill="url(#${id}g)"/>`;
}

const COL = {
  color: { a: C.teal, b: C.green, c: C.tealDeep, b2: C.greenDeep, bg: "#fff" },
  teal: { a: C.teal, b: C.teal, c: C.teal, bg: "#fff" },
  white: { a: "#fff", b: "#fff", c: "#fff", bg: "transparent" },
};

const svgWrap = (w, h, body, bg = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${bg}${body}</svg>\n`;

// ---------- composiciones ----------
function textColors(mode) {
  if (mode === "color") return { title: C.teal, sub: C.olive, script: C.script };
  if (mode === "teal") return { title: C.teal, sub: C.teal, script: C.teal };
  return { title: "#fff", sub: "#fff", script: "#fff" };
}

function vertical(mode) {
  const t = textColors(mode);
  const title = textPath(cinzel, "TANFIP", 118, 10);
  const sub = textPath(montserrat, "fisioterapia & pilates", 38, 1.5);
  const sc = textPath(allura, "by Tania Castro", 58, 1);
  const W = Math.max(title.width, sub.width, sc.width) + 80;
  const markS = 240;
  let y = 0;
  const mx = (W - markS) / 2;
  const body = [];
  body.push(`<g transform="translate(${mx} 20) scale(${markS / 200})">${markInner("v" + mode, COL[mode])}</g>`);
  y = 20 + markS + 118;
  body.push(`<path transform="translate(${(W - title.width) / 2} ${y})" d="${title.d}" fill="${t.title}"/>`);
  y += 62;
  body.push(`<path transform="translate(${(W - sub.width) / 2} ${y})" d="${sub.d}" fill="${t.sub}"/>`);
  y += 66;
  body.push(`<path transform="translate(${(W - sc.width) / 2} ${y})" d="${sc.d}" fill="${t.script}"/>`);
  const H = y + 40;
  return svgWrap(Math.round(W), Math.round(H), body.join(""));
}

function horizontal(mode) {
  const t = textColors(mode);
  const title = textPath(cinzel, "TANFIP", 92, 8);
  const sub = textPath(montserrat, "fisioterapia & pilates", 29, 1.2);
  const sc = textPath(allura, "by Tania Castro", 44, 1);
  const markS = 190;
  const gap = 28;
  const textW = Math.max(title.width, sub.width, sc.width);
  const W = 20 + markS + gap + textW + 20;
  const H = markS + 40;
  const tx = 20 + markS + gap;
  const body = [];
  body.push(`<g transform="translate(20 20) scale(${markS / 200})">${markInner("h" + mode, COL[mode])}</g>`);
  body.push(`<path transform="translate(${tx} ${20 + 82})" d="${title.d}" fill="${t.title}"/>`);
  body.push(`<path transform="translate(${tx + 2} ${20 + 120})" d="${sub.d}" fill="${t.sub}"/>`);
  body.push(`<path transform="translate(${tx + 2} ${20 + 168})" d="${sc.d}" fill="${t.script}"/>`);
  return svgWrap(Math.round(W), Math.round(H), body.join(""));
}

function wordmark(mode) {
  const t = textColors(mode);
  const title = textPath(cinzel, "TANFIP", 118, 10);
  const sub = textPath(montserrat, "fisioterapia & pilates", 38, 1.5);
  const W = Math.max(title.width, sub.width) + 60;
  const body = `<path transform="translate(${(W - title.width) / 2} 140)" d="${title.d}" fill="${t.title}"/>
  <path transform="translate(${(W - sub.width) / 2} 200)" d="${sub.d}" fill="${t.sub}"/>`;
  return svgWrap(Math.round(W), 240, body);
}

function isotipo(mode) {
  return svgWrap(200, 200, markInner("i" + mode, COL[mode]));
}

function iconSquare(variant) {
  // 512x512. variant: brand (fondo verde azulado, marca blanca), light (fondo blanco, marca color)
  const bg =
    variant === "brand"
      ? `<defs><linearGradient id="bgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.tealDeep}"/></linearGradient></defs><rect width="512" height="512" rx="112" fill="url(#bgb)"/>`
      : `<rect width="512" height="512" rx="112" fill="#F6FAF7"/><rect x="6" y="6" width="500" height="500" rx="106" fill="none" stroke="${C.teal}" stroke-opacity=".15" stroke-width="3"/>`;
  const mode = variant === "brand" ? "white" : "color";
  const col = variant === "brand" ? { ...COL.white, bg: C.teal } : COL.color;
  const s = 340 / 200;
  return svgWrap(512, 512, `${bg}<g transform="translate(86 86) scale(${s})">${markInner("sq" + variant, col)}</g>`);
}

function maskable() {
  // sin esquinas redondeadas; marca dentro de la zona segura (60 %)
  const s = 270 / 200;
  const col = { ...COL.white, bg: C.teal };
  return svgWrap(
    512, 512,
    `<defs><linearGradient id="mk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.tealDeep}"/></linearGradient></defs>
    <rect width="512" height="512" fill="url(#mk)"/>
    <g transform="translate(121 121) scale(${s})">${markInner("mk", col)}</g>`
  );
}

// ---------- salida ----------
const out = path.resolve("public/brand");
fs.mkdirSync(out, { recursive: true });
const files = {};
for (const m of ["color", "teal", "white"]) {
  files[`isotipo-${m}.svg`] = isotipo(m);
  files[`logo-vertical-${m}.svg`] = vertical(m);
  files[`logo-horizontal-${m}.svg`] = horizontal(m);
  files[`logotipo-${m}.svg`] = wordmark(m);
}
files["icono-cuadrado.svg"] = iconSquare("brand");
files["icono-cuadrado-claro.svg"] = iconSquare("light");
files["icono-maskable.svg"] = maskable();

for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(out, n), s);

const png = async (name, svg, w, flatten) => {
  let p = sharp(Buffer.from(svg), { density: 300 }).resize({ width: w });
  if (flatten) p = p.flatten({ background: flatten });
  await p.png().toFile(path.join(out, name));
};
await png("isotipo-color.png", files["isotipo-color.svg"], 1024);
await png("logo-vertical-color.png", files["logo-vertical-color.svg"], 1600);
await png("logo-horizontal-color.png", files["logo-horizontal-color.svg"], 1800);
await png("logo-vertical-blanco.png", files["logo-vertical-white.svg"], 1600);
await png("icono-cuadrado.png", files["icono-cuadrado.svg"], 1024);

fs.mkdirSync("public/icons", { recursive: true });
for (const s of [192, 512]) {
  await png(`../icons/icon-${s}.png`, files["icono-cuadrado.svg"], s);
  await png(`../icons/maskable-${s}.png`, files["icono-maskable.svg"], s);
}
await png("../icons/apple-touch-icon.png", files["icono-maskable.svg"], 180);
await png("../icons/favicon-32.png", files["icono-cuadrado.svg"], 32);
fs.copyFileSync("public/brand/icono-cuadrado.svg", "src/app/icon.svg");
console.log("OK", Object.keys(files).length, "svg");
