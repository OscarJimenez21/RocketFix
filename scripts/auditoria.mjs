// Auditoría del catálogo: cuenta productos y versiones, revisa identificadores, campos, fotos y galerías,
// y escribe docs/auditoria-catalogo.md. Se corre con: npm run auditoria
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";

const leer = f => JSON.parse(readFileSync(`src/data/${f}.json`, "utf8"));
const productos = leer("productos"), categorias = leer("categorias"), galerias = leer("galerias"), descripciones = leer("descripciones");
const legacy = readFileSync("legacy/index.html", "utf8");

const ids = productos.map(p => p.id);
const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
const versiones = productos.reduce((s, p) => s + p.opciones.length, 0);
const catValidas = new Set(Object.values(categorias).flat().map(c => c.id));
const existe = ruta => existsSync(`public/${ruta}`);

const sinFoto = productos.filter(p => !p.imagen);
const fotoRota = productos.filter(p => p.imagen && !existe(p.imagen));
const sinMarca = productos.filter(p => !p.marca);
const sinCategoria = productos.filter(p => p.tienda !== "cel" && !catValidas.has(p.categoria));
const precioRaro = productos.filter(p => p.opciones.some(o => !Number.isFinite(o.precio) || o.precio <= 0));
const nombreRepetido = Object.entries(productos.reduce((m, p) => ((m[p.nombre] = (m[p.nombre] || 0) + 1), m), {})).filter(([, n]) => n > 1);
const sinDescripcion = productos.filter(p => !descripciones[p.id]);
const galeriaRota = Object.entries(galerias).flatMap(([id, fotos]) => fotos.filter(f => !existe(f)).map(f => `${id}: ${f}`));
const galeriaHuerfana = Object.keys(galerias).filter(id => !ids.includes(id));
const conGaleria = productos.filter(p => galerias[p.id]?.length);

// Fotos de la carpeta que ningún producto usa
const usadas = new Set([...productos.map(p => p.imagen).filter(Boolean), ...Object.values(galerias).flat()]);
const sueltas = readdirSync("public/fotos").filter(f => f.endsWith(".jpg") && !usadas.has(`fotos/${f}`));

// Campos presentes en los productos
const campos = {};
productos.forEach(p => Object.keys(p).forEach(k => (campos[k] = (campos[k] || 0) + 1)));

// Cuántos productos declara la tienda original (líneas de PRODUCTOS con id)
const enLegacy = (legacy.match(/^\s*\{ id: "[^"]+",\s*tienda:/gm) || []).length;

const porTienda = Object.entries(productos.reduce((m, p) => ((m[p.tienda] = (m[p.tienda] || 0) + 1), m), {}));
const lista = (arr, f = x => x) => arr.length ? arr.map(x => `- ${f(x)}`).join("\n") : "- Ninguno";

const md = `# Auditoría del catálogo de Rocket Fix

Generada por \`scripts/auditoria.mjs\` a partir de \`legacy/index.html\` (la tienda publicada) y de los datos extraídos en \`src/data\`.

## Resumen

| Dato | Valor |
|---|---|
| Productos (fichas) | ${productos.length} |
| Versiones de producto (cada opción de precio) | ${versiones} |
| Líneas de producto en la tienda original | ${enLegacy} |
| Identificadores repetidos | ${repetidos.length} |
| Productos con foto principal | ${productos.length - sinFoto.length} |
| Productos con galería (carrusel) | ${conGaleria.length} |
| Fotos de galería | ${Object.values(galerias).flat().length} |
| Productos con descripción o ficha del proveedor | ${productos.length - sinDescripcion.length} |

El "aproximadamente 1.083" corresponde a las **versiones** (por ejemplo, un celular en 128 GB y 256 GB son dos versiones de una misma ficha). Las fichas de producto son ${productos.length}.

## Productos por sección

| Sección | Productos |
|---|---|
${porTienda.map(([t, n]) => `| ${t} | ${n} |`).join("\n")}

## Campos de los productos

| Campo | Productos que lo tienen |
|---|---|
${Object.entries(campos).sort((a, b) => b[1] - a[1]).map(([k, n]) => `| \`${k}\` | ${n} |`).join("\n")}

\`opciones\` y \`estado\` se agregan al extraer (como lo hacía la tienda original al cargar): un producto con \`precio\` queda con una sola opción sin nombre, y el estado por defecto es "Nuevo".

## Revisión

### Identificadores repetidos
${lista(repetidos)}

### Productos sin foto principal
${lista(sinFoto, p => `${p.id} · ${p.nombre}`)}

### Fotos principales que no existen en la carpeta
${lista(fotoRota, p => `${p.id} · ${p.imagen}`)}

### Fotos de galería que no existen
${lista(galeriaRota)}

### Galerías de productos que no existen
${lista(galeriaHuerfana)}

### Productos sin marca (${sinMarca.length})
${lista(sinMarca, p => `${p.id} · ${p.nombre}`)}

### Productos con categoría inválida
${lista(sinCategoria, p => `${p.id} · ${p.categoria}`)}

### Precios vacíos o en cero
${lista(precioRaro, p => `${p.id} · ${p.nombre}`)}

### Nombres repetidos (${nombreRepetido.length})
Son productos distintos con el mismo nombre (por ejemplo, un PC armado en dos versiones o una caja nueva y open box). Se conservan todos.
${lista(nombreRepetido, ([n, k]) => `${n} (${k})`)}

### Fotos en la carpeta que ningún producto usa (${sueltas.length})
${lista(sueltas.slice(0, 60))}${sueltas.length > 60 ? `\n- … y ${sueltas.length - 60} más` : ""}
`;

mkdirSync("docs", { recursive: true });
writeFileSync("docs/auditoria-catalogo.md", md);
console.log(`productos ${productos.length} · versiones ${versiones} · legacy ${enLegacy} · repetidos ${repetidos.length} · sin foto ${sinFoto.length}` +
  ` · foto rota ${fotoRota.length} · galería rota ${galeriaRota.length} · sin marca ${sinMarca.length} · cat inválida ${sinCategoria.length}` +
  ` · precio raro ${precioRaro.length} · nombres repetidos ${nombreRepetido.length} · fotos sueltas ${sueltas.length}`);
