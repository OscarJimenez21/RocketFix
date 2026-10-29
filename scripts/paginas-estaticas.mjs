/* Páginas estáticas para buscadores (se ejecuta después de `vite build`).
   La tienda usa direcciones con # (/RocketFix/#p/sa07), y Google no indexa lo que va después del #: para él la tienda
   entera era una sola página. Este script crea una página HTML real por producto, sección, marca y artículo
   (/RocketFix/p/sa07/, /RocketFix/celulares/…) a partir de dist/index.html, cada una con:
   - su título, descripción, dirección canónica e imagen para compartir (WhatsApp muestra la foto del producto);
   - datos estructurados (JSON-LD): Product con su precio en pesos, BreadcrumbList, y en la portada la tienda (OnlineStore);
   - el contenido básico en el HTML (#estatico), para los buscadores y asistentes de IA que no ejecutan JavaScript.
     Con JavaScript se oculta y la tienda se carga encima, igual que siempre (main.tsx lleva la dirección a su #).
   También escribe sitemap.xml. Solo usa datos reales del catálogo: no declara disponibilidad, garantías ni calificaciones.
   Uso: node scripts/paginas-estaticas.mjs  (lo corre `npm run build`) */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const DIST = join(RAIZ, "dist");
const BASE = process.env.BASE_PATH || "/RocketFix/";
// Dirección pública de la tienda (cuando tenga dominio propio, se cambia aquí y en index.html)
const SITIO = (process.env.SITIO_URL || "https://oscarjimenez21.github.io") + BASE;
const leer = f => JSON.parse(readFileSync(join(RAIZ, "src/data", f), "utf8"));

const CONFIG = leer("config.json");
const PRODUCTOS = leer("productos.json");
const GALERIAS = leer("galerias.json");
const DESCRIPCIONES = leer("descripciones.json");
const CATEGORIAS = leer("categorias.json");
const CABECERAS = leer("cabeceras.json");
const CONTENIDO = leer("contenido.json");
const TEXTOS = leer("articulos-texto.json");
const { vistas: VISTAS, tiendaVista: TIENDA_VISTA, estados: ESTADOS, incluye: INCLUYE, articulos: ARTICULOS } = CONTENIDO;
const nombreCat = Object.fromEntries(Object.values(CATEGORIAS).flat().map(c => [c.id, c.nombre]));

// ---------- Utilidades (las mismas reglas de la tienda: src/lib/formato.ts y src/lib/descripcion.ts) ----------
const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const dinero = n => pesos.format(n);
const lista = items => new Intl.ListFormat("es", { type: "conjunction" }).format(items);
const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const abs = ruta => /^https?:/.test(ruta) ? ruta : SITIO + ruta.replace(/^\//, "");
const desde = p => Math.min(...p.opciones.map(o => o.precio));
const hasta = p => Math.max(...p.opciones.map(o => o.precio));
const etiquetaDe = p => [p.tienda === "cel" ? null : p.categoria ? nombreCat[p.categoria] : null, p.marca].filter(Boolean).join(" · ");
const wa = texto => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
// Corta en la última palabra completa antes del límite
const recortar = (s, max) => s.length <= max ? s : s.slice(0, s.lastIndexOf(" ", max - 1)).replace(/[,;:·\s]+$/, "") + "…";

function armarDescripcion(p) {
  const d = DESCRIPCIONES[p.id] ?? {};
  const cond = ESTADOS[p.estado] ?? p.estado;
  const condMin = cond.charAt(0).toLowerCase() + cond.slice(1);
  const conMarca = p.marca && !norm(p.nombre).includes(norm(p.marca)) ? ` de ${p.marca}` : "";
  const varias = p.opciones.length > 1;
  const resumen = d.resumen ||
    `${p.nombre}${conMarca}${varias ? `, disponible en ${lista(p.opciones.map(o => o.nombre))}` : ""}. ${
      p.estado !== "Nuevo" ? `Estado: ${condMin}.` : /^escritorio/.test(p.categoria ?? "") ? "Equipo nuevo, armado y probado antes de entregarlo." : "Producto nuevo, en su empaque original."
    } Si tienes dudas sobre sus especificaciones, escríbenos y te asesoramos.`;
  const filas = [["Marca", p.marca], ["Tipo", p.tienda === "cel" ? "Celular" : p.categoria ? nombreCat[p.categoria] : undefined], ["Estado", cond]];
  if (varias) filas.push([p.etiqueta || "Versiones", lista(p.opciones.map(o => o.nombre))]);
  else if (p.opciones[0]?.nombre) filas.push([p.etiqueta || "Versión", p.opciones[0].nombre]);
  if (p.specs.length && !(d.ficha && p.tienda === "pc")) filas.push(["Detalles", p.specs.join(" · ")]);
  for (const f of d.ficha ?? []) filas.push(f);
  let incluye = (p.categoria && INCLUYE[p.categoria]) || INCLUYE[p.tienda] || INCLUYE.varios || "";
  if (p.nota && !/pedido/i.test(p.nota)) incluye += ` ${p.nota.replace(/^Obsequio:\s*/i, "De regalo: ")}.`;
  if (p.estado !== "Nuevo") incluye += ` Como el producto es ${condMin}, te confirmamos los accesorios que trae.`;
  return { resumen, filas: filas.filter(f => f[1]), incluye };
}

// ---------- Rutas de las páginas ----------
const rutaProducto = p => `p/${p.id}/`;
const rutaVista = v => `${v}/`;
const rutaMarca = m => `marca/${slug(m)}/`;
const vistaDe = p => TIENDA_VISTA[p.tienda];
const MARCAS = Object.entries(PRODUCTOS.reduce((a, p) => (p.marca && (a[p.marca] = (a[p.marca] ?? 0) + 1), a), {}))
  .filter(([, n]) => n >= 3).map(([m]) => m).sort((a, b) => a.localeCompare(b));

// ---------- Plantilla ----------
const PLANTILLA = readFileSync(join(DIST, "index.html"), "utf8");
// Con JavaScript, el contenido estático se oculta antes de pintarse (sin parpadeo) y la tienda lo reemplaza
const OCULTAR = `<script>document.documentElement.classList.add("js")</script><style>.js #estatico{display:none}</style>`;
const ORGANIZACION = SITIO + "#tienda";

function pagina({ ruta, titulo, descripcion, imagen, altImagen, jsonld, cuerpo }) {
  const url = SITIO + ruta;
  let h = PLANTILLA
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(descripcion)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(titulo)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(descripcion)}`);
  if (imagen) {
    // Fotos de producto: cuadradas de 800 x 800
    h = h.replace(/(<meta property="og:image" content=")[^"]*/, `$1${abs(imagen)}`)
      .replace(/(<meta property="og:image:type" content=")[^"]*/, "$1image/jpeg")
      .replace(/(<meta property="og:image:width" content=")[^"]*/, "$1800")
      .replace(/(<meta property="og:image:height" content=")[^"]*/, "$1800")
      .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${esc(altImagen)}`);
  }
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": jsonld }).replace(/</g, "\\u003c")}</script>`;
  h = h.replace("</head>", `${OCULTAR}${ld}</head>`)
    .replace(/(<div id="root"><\/div>)/, `$1<div id="estatico" class="contenedor py-8">${cuerpo}</div>`);
  if (h.includes("{{")) throw new Error(`Plantilla sin reemplazar en ${ruta}`);
  mkdirSync(join(DIST, ruta), { recursive: true });
  writeFileSync(join(DIST, ruta, "index.html"), h);
  return url;
}

const migas = items => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([nombre, ruta], i) => ({ "@type": "ListItem", position: i + 1, name: nombre, ...(ruta != null ? { item: SITIO + ruta } : {}) }))
});
const migasHtml = items => `<nav aria-label="Ruta">${items.map(([n, r]) => r != null ? `<a href="${BASE}${r}">${esc(n)}</a>` : `<span>${esc(n)}</span>`).join(" › ")}</nav>`;
const contacto = `<p>Pedidos y asesoría por WhatsApp: <a href="${wa(`Hola ${CONFIG.nombre}, `)}">${esc(CONFIG.whatsappVisible)}</a>. ${esc(CONFIG.domicilio)} ${esc(CONFIG.envio)}</p>`;
const listaProductos = ps => `<ul>${ps.map(p => `<li><a href="${BASE}${rutaProducto(p)}">${esc(p.nombre)}</a> · ${p.opciones.length > 1 ? "desde " : ""}${esc(dinero(desde(p)))}</li>`).join("")}</ul>`;
const CONDICION = { Nuevo: "https://schema.org/NewCondition", CPO: "https://schema.org/RefurbishedCondition", Usado: "https://schema.org/UsedCondition" };

const urls = [];

// Productos con el mismo nombre (ej. dos «PC Core i7 14700» de distinta configuración): el título lleva el primer dato
// que los diferencia (de sus características o de la ficha), para que Google no los tome como páginas repetidas
const distintivo = {};
for (const grupo of Object.values(Object.groupBy(PRODUCTOS, p => p.nombre)).filter(g => g.length > 1)) {
  const datos = grupo.map(p => [...p.specs, ...(DESCRIPCIONES[p.id]?.ficha ?? []).map(([, v]) => v)]);
  const largo = Math.max(...datos.map(d => d.length));
  const k = [...Array(largo).keys()].find(i => new Set(datos.map(d => d[i] ?? "")).size === grupo.length);
  grupo.forEach((p, j) => { distintivo[p.id] = k !== undefined && datos[j][k] ? datos[j][k] : p.id; });
}
const tituloProducto = p => `${p.nombre}${distintivo[p.id] ? ` (${distintivo[p.id]})` : ""} · ${CONFIG.nombre}`;

// ---------- Productos ----------
for (const p of PRODUCTOS) {
  const vista = vistaDe(p);
  const ruta = rutaProducto(p);
  const d = armarDescripcion(p);
  const fotos = p.imagen ? [p.imagen, ...(GALERIAS[p.id] ?? [])] : [];
  const precio = desde(p), varias = p.opciones.length > 1;
  const condicion = CONDICION[p.estado];
  const oferta = varias
    ? { "@type": "AggregateOffer", priceCurrency: "COP", lowPrice: precio, highPrice: hasta(p), offerCount: p.opciones.length, url: SITIO + ruta }
    : { "@type": "Offer", priceCurrency: "COP", price: precio, url: SITIO + ruta, seller: { "@id": ORGANIZACION } };
  if (condicion) oferta.itemCondition = condicion;
  const producto = {
    "@type": "Product", "@id": SITIO + ruta + "#producto", name: p.nombre, sku: p.id, description: d.resumen,
    ...(fotos.length ? { image: fotos.map(abs) } : {}),
    ...(p.marca ? { brand: { "@type": "Brand", name: p.marca } } : {}),
    ...(p.categoria ? { category: nombreCat[p.categoria] } : {}),
    offers: oferta
  };
  const camino = [["Inicio", ""], [VISTAS[vista] ?? vista, rutaVista(vista)], [p.nombre, null]];
  const precioTxt = `${varias ? "desde " : ""}${dinero(precio)}`;
  const descripcion = recortar(`${p.nombre}${distintivo[p.id] ? ` (${distintivo[p.id]})` : ""} ${precioTxt}${p.estado !== "Nuevo" ? ` (${ESTADOS[p.estado] ?? p.estado})` : ""}. Domicilio en Bogotá y envíos a todo Colombia. Compra con asesoría por WhatsApp en ${CONFIG.nombre}.`, 160);
  const cuerpo = [
    migasHtml(camino),
    `<h1>${esc(p.nombre)}</h1>`,
    etiquetaDe(p) ? `<p>${esc(etiquetaDe(p))}</p>` : "",
    fotos[0] ? `<img src="${BASE}${fotos[0]}" alt="${esc(p.nombre)}" width="800" height="800">` : "",
    `<p><strong>${esc(precioTxt[0].toUpperCase() + precioTxt.slice(1))}</strong> (pesos colombianos)</p>`,
    varias ? `<ul>${p.opciones.map(o => `<li>${esc(o.nombre)}: ${esc(dinero(o.precio))}</li>`).join("")}</ul>` : "",
    p.nota ? `<p>${esc(p.nota)}</p>` : "",
    `<h2>Descripción</h2><p>${esc(d.resumen)}</p>`,
    `<h2>Características</h2><dl>${d.filas.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`,
    d.incluye ? `<h2>Qué incluye la caja</h2><p>${esc(d.incluye)}</p>` : "",
    `<p><a href="${wa(`Hola ${CONFIG.nombre}, me interesa ${p.nombre} (${dinero(precio)}). ¿Está disponible?`)}">Preguntar por WhatsApp</a>. Antes de cualquier pago te confirmamos disponibilidad.</p>`,
    contacto
  ].join("");
  urls.push(pagina({ ruta, titulo: tituloProducto(p), descripcion, imagen: fotos[0], altImagen: p.nombre, jsonld: [producto, migas(camino)], cuerpo }));
}

// ---------- Secciones ----------
for (const [tienda, vista] of Object.entries(TIENDA_VISTA)) {
  const ps = PRODUCTOS.filter(p => p.tienda === tienda);
  if (!ps.length) continue;
  const cab = CABECERAS[vista] ?? {};
  const titulo = cab.titulo ?? VISTAS[vista] ?? vista;
  const camino = [["Inicio", ""], [titulo, null]];
  const descripcion = recortar(cab.lead ? `${cab.lead} Domicilio en Bogotá y envíos a todo Colombia.` : `${titulo} en ${CONFIG.nombre}: ${ps.length} productos con domicilio en Bogotá y envíos a todo Colombia.`, 160);
  const cuerpo = migasHtml(camino) + `<h1>${esc(titulo)}</h1>` + (cab.lead ? `<p>${esc(cab.lead)}</p>` : "") + `<p>${ps.length} productos.</p>` + listaProductos(ps) + contacto;
  urls.push(pagina({ ruta: rutaVista(vista), titulo: `${titulo} · ${CONFIG.nombre}`, descripcion, jsonld: [migas(camino)], cuerpo }));
}

// ---------- Marcas ----------
for (const m of MARCAS) {
  const ps = PRODUCTOS.filter(p => p.marca === m);
  const camino = [["Inicio", ""], [m, null]];
  const descripcion = recortar(`${ps.length} productos ${m} en ${CONFIG.nombre}: precios en pesos, domicilio en Bogotá y envíos a todo Colombia. Asesoría por WhatsApp.`, 160);
  const cuerpo = migasHtml(camino) + `<h1>${esc(m)}</h1><p>${ps.length} productos ${esc(m)} en ${esc(CONFIG.nombre)}.</p>` + listaProductos(ps) + contacto;
  urls.push(pagina({ ruta: rutaMarca(m), titulo: `${m} en Colombia · ${CONFIG.nombre}`, descripcion, jsonld: [migas(camino)], cuerpo }));
}

// ---------- Blog y artículos ----------
{
  const camino = [["Inicio", ""], [VISTAS.blog, null]];
  const cuerpo = migasHtml(camino) + `<h1>${esc(VISTAS.blog)}</h1><ul>${ARTICULOS.map(a => `<li><a href="${BASE}${a.id}/">${esc(a.titulo)}</a>: ${esc(a.resumen)}</li>`).join("")}</ul>` + contacto;
  urls.push(pagina({ ruta: "blog/", titulo: `${VISTAS.blog} · ${CONFIG.nombre}`, descripcion: recortar(ARTICULOS.map(a => a.titulo).join(", ") + `. Guías y servicio técnico de ${CONFIG.nombre} en Bogotá.`, 160), jsonld: [migas(camino)], cuerpo }));
}
for (const a of ARTICULOS) {
  const camino = [["Inicio", ""], [VISTAS.blog, "blog/"], [a.titulo, null]];
  const texto = TEXTOS[a.id] ?? "";
  const parrafos = texto.split(/\n+/).map(t => t.trim()).filter(Boolean).map(t => `<p>${esc(t)}</p>`).join("");
  urls.push(pagina({ ruta: `${a.id}/`, titulo: `${a.titulo} · ${CONFIG.nombre}`, descripcion: recortar(a.resumen, 160), jsonld: [migas(camino)], cuerpo: migasHtml(camino) + `<h1>${esc(a.titulo)}</h1><p>${esc(a.resumen)}</p>${parrafos}` + contacto }));
}

// ---------- Portada: la tienda y el sitio, más enlaces a todo ----------
{
  const tiendaLd = {
    "@type": "OnlineStore", "@id": ORGANIZACION, name: CONFIG.nombre, url: SITIO, logo: abs("apple-touch-icon.png"),
    telephone: CONFIG.whatsappVisible, areaServed: { "@type": "Country", name: "Colombia" },
    contactPoint: { "@type": "ContactPoint", telephone: CONFIG.whatsappVisible, contactType: "customer service", availableLanguage: "es", areaServed: "CO" }
  };
  const sitioLd = { "@type": "WebSite", "@id": SITIO + "#sitio", name: CONFIG.nombre, url: SITIO, inLanguage: "es-CO", publisher: { "@id": ORGANIZACION } };
  const secciones = Object.entries(TIENDA_VISTA).filter(([t]) => PRODUCTOS.some(p => p.tienda === t));
  const cuerpo = `<h1>${esc(CONFIG.nombre)}: tecnología para tu día a día</h1>` +
    `<p>Celulares, computadores, gaming y accesorios con entrega a domicilio. Compra con asesoría por WhatsApp y solicita servicio técnico para tu hogar o negocio.</p>` +
    `<h2>Secciones</h2><ul>${secciones.map(([, v]) => `<li><a href="${BASE}${rutaVista(v)}">${esc(VISTAS[v] ?? v)}</a></li>`).join("")}</ul>` +
    `<h2>Marcas</h2><ul>${MARCAS.map(m => `<li><a href="${BASE}${rutaMarca(m)}">${esc(m)}</a></li>`).join("")}</ul>` +
    `<h2>Servicio técnico</h2><ul>${ARTICULOS.map(a => `<li><a href="${BASE}${a.id}/">${esc(a.titulo)}</a></li>`).join("")}</ul>` + contacto;
  // La portada conserva su título, descripción e imagen; solo se agregan los datos estructurados y el contenido
  const h = PLANTILLA.replace("</head>", `${OCULTAR}<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [tiendaLd, sitioLd] }).replace(/</g, "\\u003c")}</script></head>`)
    .replace(/(<div id="root"><\/div>)/, `$1<div id="estatico" class="contenedor py-8">${cuerpo}</div>`);
  writeFileSync(join(DIST, "index.html"), h);
  urls.unshift(SITIO);
}

// ---------- Mapa del sitio ----------
const hoy = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${hoy}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log(`Páginas estáticas: ${urls.length} (productos ${PRODUCTOS.length}, marcas ${MARCAS.length}) · sitemap.xml listo`);
