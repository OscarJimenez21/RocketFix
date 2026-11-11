/* Fotos livianas: de cada foto de producto (public/fotos/*.jpg y public/fotos/galeria/*.jpg, de 800 × 800) saca dos
   copias en WebP, de 300 y 600 px, en public/fotos/liviana/300/… y public/fotos/liviana/600/…
   El navegador escoge la que necesita según el tamaño en pantalla (srcset): una tarjeta en celular ya no baja la foto
   de 800 px en JPG. La original no se toca y sigue sirviendo para la foto grande y para compartir.
   Las copias no van al repositorio (.gitignore): se hacen al compilar y al abrir la tienda en el computador. Solo hace
   las que faltan o las de fotos que cambiaron, así que la segunda vez tarda un instante.
   Uso: node scripts/fotos-livianas.mjs  (lo corren `npm run dev` y `npm run build`) */
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { availableParallelism } from "node:os";
import sharp from "sharp";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const FOTOS = join(RAIZ, "public", "fotos");
const DESTINO = join(FOTOS, "liviana");
// Debe coincidir con ANCHOS_LIVIANOS en src/lib/formato.ts
const ANCHOS = [300, 600];
const CALIDAD = 78;

/** Rutas relativas a public/fotos de todas las fotos JPG de producto (la carpeta de primer nivel y la galería) */
const fuentes = [
  ...readdirSync(FOTOS).filter(f => f.endsWith(".jpg")),
  ...(existsSync(join(FOTOS, "galeria")) ? readdirSync(join(FOTOS, "galeria")).filter(f => f.endsWith(".jpg")).map(f => `galeria/${f}`) : [])
];

const tareas = [];
for (const rel of fuentes) {
  const origen = join(FOTOS, rel);
  const fecha = statSync(origen).mtimeMs;
  for (const ancho of ANCHOS) {
    const salida = join(DESTINO, String(ancho), rel.replace(/\.jpg$/, ".webp"));
    if (existsSync(salida) && statSync(salida).mtimeMs >= fecha) continue;
    tareas.push({ origen, salida, ancho });
  }
}

let hechas = 0, fallas = 0;
const trabajar = async () => {
  for (let t = tareas.shift(); t; t = tareas.shift()) {
    try {
      mkdirSync(dirname(t.salida), { recursive: true });
      await sharp(t.origen).resize(t.ancho, t.ancho, { fit: "inside", withoutEnlargement: true }).webp({ quality: CALIDAD, effort: 4 }).toFile(t.salida);
      hechas++;
    } catch (e) {
      fallas++;
      console.error(`No se pudo aligerar ${t.origen}: ${e.message}`);
    }
  }
};
const inicio = performance.now();
await Promise.all(Array.from({ length: Math.max(2, availableParallelism()) }, trabajar));
console.log(`Fotos livianas: ${hechas} nuevas de ${fuentes.length} fotos (${((performance.now() - inicio) / 1000).toFixed(1)} s)`);
// Una foto dañada no detiene la tienda: esa foto se muestra en su tamaño original (FotoProducto vuelve al JPG si falla)
if (fallas) console.warn(`Fotos livianas: ${fallas} no se pudieron hacer`);
