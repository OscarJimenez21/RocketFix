// Verifica que el catálogo de la versión nueva sea el mismo de la tienda original (legacy/index.html):
// mismos productos en el mismo orden, con los mismos nombres, precios y fotos; que existan todos los archivos de fotos;
// y que no se haya colado información privada (costos, archivos de Excel o CSV). Se corre con: npm run verificar
// Termina con error si algo no coincide.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync("legacy/index.html", "utf8").replace(/\r\n/g, "\n");
const leer = f => JSON.parse(readFileSync(`src/data/${f}.json`, "utf8"));
const productos = leer("productos"), galerias = leer("galerias"), descripciones = leer("descripciones"), config = leer("config"), contenido = leer("contenido");

// Catálogo original, evaluado aquí mismo (no se reutiliza el resultado de la extracción)
const inicio = html.indexOf("<script>") + "<script>".length;
const fin = html.indexOf("/* ==========================================================================\n   Funcionamiento de la página");
const original = vm.runInNewContext(html.slice(inicio, fin) + ";({ PRODUCTOS, GALERIAS, DESCRIPCIONES })", {}, { timeout: 5000 });

const fallas = [];
const fallar = (tema, detalle) => fallas.push(`${tema}: ${detalle}`);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. Mismos productos, en el mismo orden y con los mismos datos visibles
if (original.PRODUCTOS.length !== productos.length) fallar("Cantidad", `original ${original.PRODUCTOS.length}, nueva ${productos.length}`);
const ids = productos.map(p => p.id);
if (new Set(ids).size !== ids.length) fallar("Identificadores", "hay ids repetidos");
original.PRODUCTOS.forEach((o, i) => {
  const n = productos[i];
  if (!n || n.id !== o.id) return fallar("Orden", `posición ${i}: original ${o.id}, nueva ${n?.id}`);
  for (const k of ["nombre", "tienda", "categoria", "marca", "imagen", "stock", "nota", "etiqueta"]) {
    if (!igual(o[k], n[k])) fallar("Dato", `${o.id}.${k}: «${o[k]}» ≠ «${n[k]}»`);
  }
  const precios = (o.opciones || [["", o.precio]]).map(([nombre, precio]) => ({ nombre, precio }));
  if (!igual(precios, n.opciones)) fallar("Precio", `${o.id}: ${JSON.stringify(precios)} ≠ ${JSON.stringify(n.opciones)}`);
  if (!igual(o.specs || [], n.specs)) fallar("Specs", o.id);
  if ((o.estado || "Nuevo") !== n.estado) fallar("Estado", o.id);
});
const versiones = productos.reduce((s, p) => s + p.opciones.length, 0);

// 2. Galerías y descripciones idénticas a las originales
if (!igual(original.GALERIAS, galerias)) fallar("Galerías", "no coinciden con las originales");
if (!igual(original.DESCRIPCIONES, descripciones)) fallar("Descripciones", "no coinciden con las originales");
for (const [id, d] of Object.entries(descripciones)) {
  if (!ids.includes(id)) fallar("Descripciones", `${id} no es un producto`);
  (d.ficha || []).forEach((fila, k) => {
    if (!Array.isArray(fila) || fila.length !== 2 || fila.some(t => typeof t !== "string")) fallar("Ficha", `${id} fila ${k} no tiene exactamente 2 textos`);
  });
}

// 3. Todas las fotos existen en public/
const existe = ruta => existsSync(`public/${ruta}`);
productos.filter(p => p.imagen && !existe(p.imagen)).forEach(p => fallar("Foto", `${p.id}: falta public/${p.imagen}`));
Object.entries(galerias).forEach(([id, fotos]) => {
  if (!ids.includes(id)) fallar("Galerías", `${id} no es un producto`);
  fotos.filter(f => !existe(f)).forEach(f => fallar("Galería", `${id}: falta public/${f}`));
});

// 4. Productos que la página nombra directamente
const tiendas = readFileSync("src/data/tiendas.ts", "utf8");
for (const [, id] of tiendas.matchAll(/foto: "([^"]+)"/g)) if (!ids.includes(id)) fallar("Portada", `la foto de categoría usa ${id}, que no existe`);
(contenido.masVendidos || []).filter(id => !ids.includes(id)).forEach(id => fallar("Más vendidos", `${id} no existe`));

// 5. Nada privado en lo que se publica: sin costos ni márgenes, sin hojas de cálculo, solo la llave pública de Bold
const camposPrivados = /^(costo|cost|margen|proveedor|precioCompra|utilidad)$/i;
productos.forEach(p => Object.keys(p).filter(k => camposPrivados.test(k)).forEach(k => fallar("Privado", `${p.id} tiene el campo ${k}`)));
if (!igual(Object.keys(config.bold || {}).sort(), ["firmaUrl", "llave"])) fallar("Bold", "la configuración de Bold tiene campos de más");
const ignorar = new Set(["node_modules", "dist", ".git", ".vite"]);
const recorrer = dir => readdirSync(dir).flatMap(f => {
  if (ignorar.has(f)) return [];
  const ruta = `${dir}/${f}`;
  return statSync(ruta).isDirectory() ? recorrer(ruta) : [ruta];
});
const archivos = recorrer(".");
archivos.filter(f => /\.(xlsx?|xlsm|csv|tsv)$/i.test(f)).forEach(f => fallar("Privado", `hoja de cálculo en el proyecto: ${f}`));
const textos = archivos.filter(f => /\.(ts|tsx|js|mjs|json|html|css|md)$/i.test(f) && !f.startsWith("./legacy/"));
for (const f of textos) {
  const t = readFileSync(f, "utf8");
  if (/(sk_live|sk_test|secret[_-]?key|llave[_ ]secreta)\s*[:=]\s*["'][^"']{8,}/i.test(t)) fallar("Privado", `posible llave secreta en ${f}`);
}

console.log(`Productos: ${productos.length} (original: ${original.PRODUCTOS.length}) · versiones: ${versiones}`);
console.log(`Galerías: ${Object.keys(galerias).length} · descripciones: ${Object.keys(descripciones).length} · archivos revisados: ${archivos.length}`);
if (fallas.length) {
  console.error(`\n${fallas.length} diferencia(s):`);
  fallas.slice(0, 50).forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log("Todo coincide con la tienda original.");
