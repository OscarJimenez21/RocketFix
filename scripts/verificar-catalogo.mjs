// Revisa el catálogo antes de publicar: ids únicos, precios válidos, fichas bien formadas, que existan todos los
// archivos de fotos y que no se haya colado información privada (costos, archivos de Excel o CSV). Si algo falla,
// termina con error y GitHub no publica. Se corre con: npm run verificar
// También compara con la tienda anterior (legacy/index.html) y cuenta las diferencias (precios cambiados,
// productos nuevos…); son normales al actualizar la tienda y solo se informan.
// Con "npm run verificar -- --estricto" las diferencias también cuentan como error (así se comprobó la migración).
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync("legacy/index.html", "utf8").replace(/\r\n/g, "\n");
const leer = f => JSON.parse(readFileSync(`src/data/${f}.json`, "utf8"));
const productos = leer("productos"), galerias = leer("galerias"), descripciones = leer("descripciones"), config = leer("config"), contenido = leer("contenido");

// Catálogo original, evaluado aquí mismo (no se reutiliza el resultado de la extracción)
const inicio = html.indexOf("<script>") + "<script>".length;
const fin = html.indexOf("/* ==========================================================================\n   Funcionamiento de la página");
const original = vm.runInNewContext(html.slice(inicio, fin) + ";({ PRODUCTOS, GALERIAS, DESCRIPCIONES })", {}, { timeout: 5000 });

const estricto = process.argv.includes("--estricto");
const fallas = [], diferencias = [];
const fallar = (tema, detalle) => fallas.push(`${tema}: ${detalle}`);
const diferir = (tema, detalle) => (estricto ? fallas : diferencias).push(`${tema}: ${detalle}`);
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 1. Datos válidos en cada producto
const ids = productos.map(p => p.id);
if (new Set(ids).size !== ids.length) fallar("Identificadores", "hay ids repetidos");
productos.forEach(p => {
  if (!p.id || !p.nombre || !p.tienda) fallar("Producto", `${p.id || "(sin id)"} no tiene id, nombre o sección`);
  if (!p.opciones?.length || p.opciones.some(o => !Number.isFinite(o.precio) || o.precio <= 0)) fallar("Precio", `${p.id}: precio vacío o inválido`);
});
const versiones = productos.reduce((s, p) => s + p.opciones.length, 0);

// 2. Comparación con la tienda anterior (solo informativa, salvo con --estricto)
const porId = Object.fromEntries(productos.map(p => [p.id, p]));
if (estricto && !igual(original.PRODUCTOS.map(o => o.id), ids)) fallar("Orden", "los productos no están en el mismo orden que en la tienda anterior");
original.PRODUCTOS.forEach(o => {
  const n = porId[o.id];
  if (!n) return diferir("Quitado", o.id);
  for (const k of ["nombre", "tienda", "categoria", "marca", "imagen", "stock", "nota", "etiqueta"]) {
    if (!igual(o[k], n[k])) diferir("Dato", `${o.id}.${k}: «${o[k]}» → «${n[k]}»`);
  }
  const precios = (o.opciones || [["", o.precio]]).map(([nombre, precio]) => ({ nombre, precio }));
  if (!igual(precios, n.opciones)) diferir("Precio", `${o.id}: ${JSON.stringify(precios)} → ${JSON.stringify(n.opciones)}`);
  if (!igual(o.specs || [], n.specs)) diferir("Specs", o.id);
  if ((o.estado || "Nuevo") !== n.estado) diferir("Estado", o.id);
});
const enOriginal = new Set(original.PRODUCTOS.map(o => o.id));
productos.filter(p => !enOriginal.has(p.id)).forEach(p => diferir("Nuevo", p.id));
if (!igual(original.GALERIAS, galerias)) diferir("Galerías", "cambiaron respecto a la tienda anterior");
if (!igual(original.DESCRIPCIONES, descripciones)) diferir("Descripciones", "cambiaron respecto a la tienda anterior");

// 3. Fichas técnicas bien formadas
for (const [id, d] of Object.entries(descripciones)) {
  if (!ids.includes(id)) fallar("Descripciones", `${id} no es un producto`);
  (d.ficha || []).forEach((fila, k) => {
    if (!Array.isArray(fila) || fila.length !== 2 || fila.some(t => typeof t !== "string")) fallar("Ficha", `${id} fila ${k} no tiene exactamente 2 textos`);
  });
}

// 4. Todas las fotos existen en public/
const existe = ruta => existsSync(`public/${ruta}`);
productos.filter(p => p.imagen && !existe(p.imagen)).forEach(p => fallar("Foto", `${p.id}: falta public/${p.imagen}`));
Object.entries(galerias).forEach(([id, fotos]) => {
  if (!ids.includes(id)) fallar("Galerías", `${id} no es un producto`);
  fotos.filter(f => !existe(f)).forEach(f => fallar("Galería", `${id}: falta public/${f}`));
});

// 5. Productos que la página nombra directamente
const tiendas = readFileSync("src/data/tiendas.ts", "utf8");
for (const [, id] of tiendas.matchAll(/foto: "([^"]+)"/g)) if (!ids.includes(id)) fallar("Portada", `la foto de categoría usa ${id}, que no existe`);
(contenido.masVendidos || []).filter(id => !ids.includes(id)).forEach(id => fallar("Más vendidos", `${id} no existe`));

// 5b. Calificaciones de clientes: completas y sin datos de contacto (solo nombre e inicial del apellido)
const resenas = leer("resenas");
if (!Array.isArray(resenas)) fallar("Calificaciones", "resenas.json debe ser una lista");
else resenas.forEach((r, k) => {
  const quien = r?.nombre || `#${k + 1}`;
  if (!r?.nombre?.trim() || !r?.texto?.trim()) fallar("Calificaciones", `${quien}: falta el nombre o el comentario`);
  if (!Number.isInteger(r?.estrellas) || r.estrellas < 1 || r.estrellas > 5) fallar("Calificaciones", `${quien}: las estrellas deben ser un número entero de 1 a 5`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r?.fecha ?? "") || Number.isNaN(Date.parse(r.fecha))) fallar("Calificaciones", `${quien}: la fecha debe ir como AAAA-MM-DD`);
  const todo = `${r?.nombre} ${r?.texto} ${r?.compra ?? ""}`;
  if (/(\+?57[\s.-]?)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/.test(todo) || /\S+@\S+\.\S+/.test(todo)) fallar("Calificaciones", `${quien}: parece tener un teléfono o un correo`);
});

// 6. Nada privado en lo que se publica: sin costos ni márgenes, sin hojas de cálculo, solo la llave pública de Bold
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
console.log(`Galerías: ${Object.keys(galerias).length} · descripciones: ${Object.keys(descripciones).length} · calificaciones: ${resenas.length} · archivos revisados: ${archivos.length}`);
if (diferencias.length) {
  console.log(`\nCambios respecto a la tienda anterior (no impiden publicar): ${diferencias.length}`);
  diferencias.slice(0, 15).forEach(d => console.log(" · " + d));
  if (diferencias.length > 15) console.log(` · … y ${diferencias.length - 15} más`);
}
if (fallas.length) {
  console.error(`\n${fallas.length} problema(s) que impiden publicar:`);
  fallas.slice(0, 50).forEach(f => console.error(" - " + f));
  process.exit(1);
}
console.log(estricto ? "Todo coincide con la tienda anterior." : "Catálogo listo para publicar.");
