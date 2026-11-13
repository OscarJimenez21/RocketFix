/* Idea 76 (12/11/2026): revisa la tienda ya compilada (dist/) antes de publicar.
   Lee todas las páginas HTML y comprueba que cada enlace interno (href) y cada foto o archivo (src, og:image…) exista
   en dist/. Un enlace a una página sin archivo propio abriría 404.html (para Google, una página rota).
   Uso: npm run build && npm run enlaces   (sale con error si encuentra algo roto) */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIST = join(RAIZ, "dist");
const BASE = process.env.BASE_PATH || "/RocketFix/";
const SITIO = (process.env.SITIO_URL || "https://oscarjimenez21.github.io") + BASE;

if (!existsSync(DIST)) { console.error("No hay dist/: corre primero npm run build"); process.exit(1); }

const paginas = [];
const recorrer = dir => {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const r = join(dir, f.name);
    if (f.isDirectory()) recorrer(r);
    else if (f.name.endsWith(".html") && f.name !== "404.html") paginas.push(r);
  }
};
recorrer(DIST);

/** ¿Existe en dist/ lo que pide esta dirección? (/RocketFix/celulares/ → dist/celulares/index.html) */
function existe(ruta) {
  let r = decodeURIComponent(ruta.split(/[?#]/)[0] ?? "");
  if (!r.startsWith(BASE)) return true;
  r = r.slice(BASE.length);
  const archivo = join(DIST, r);
  if (!r || r.endsWith("/")) return existsSync(join(archivo, "index.html"));
  if (existsSync(archivo) && statSync(archivo).isFile()) return true;
  return existsSync(join(archivo, "index.html"));
}

const rotos = new Map();
let revisados = 0;
for (const p of paginas) {
  const h = readFileSync(p, "utf8");
  const dirs = [
    ...[...h.matchAll(/\s(?:href|src)="([^"]+)"/g)].map(m => m[1]),
    ...[...h.matchAll(/<meta (?:property|name)="(?:og:image|twitter:image|og:url)" content="([^"]+)"/g)].map(m => m[1]),
    ...[...h.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(m => m[1])
  ];
  for (let d of dirs) {
    if (!d || d.startsWith("#") || /^(mailto|tel|data|javascript):/.test(d)) continue;
    if (d.startsWith(SITIO)) d = BASE + d.slice(SITIO.length);
    if (/^https?:/.test(d)) continue; // otros sitios (WhatsApp, Bold, imeicolombia…) no se revisan aquí
    revisados++;
    if (!existe(d)) {
      const donde = p.slice(DIST.length + 1).replace(/\\/g, "/");
      if (!rotos.has(d)) rotos.set(d, []);
      rotos.get(d).push(donde);
    }
  }
}

console.log(`Revisadas ${paginas.length} páginas y ${revisados} enlaces y archivos.`);
if (rotos.size) {
  console.error(`\n${rotos.size} direcciones no existen en dist/:`);
  for (const [d, en] of [...rotos].slice(0, 60)) console.error(`  ${d}  (en ${en.length} páginas, ej.: ${en[0]})`);
  process.exit(1);
}
console.log("Sin enlaces rotos.");
