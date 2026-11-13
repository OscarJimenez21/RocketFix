/* Páginas estáticas para buscadores (se ejecuta después de `vite build`).
   Desde el 12/11/2026 la tienda usa estas mismas direcciones limpias (antes usaba #, que Google no indexa). Este script
   crea una página HTML real por producto, sección, marca y artículo
   (/RocketFix/p/sa07/, /RocketFix/celulares/…) a partir de dist/index.html, cada una con:
   - su título, descripción, dirección canónica e imagen para compartir (WhatsApp muestra la foto del producto);
   - datos estructurados (JSON-LD): Product con su precio en pesos, BreadcrumbList, y en la portada la tienda (OnlineStore);
     los productos de «Preguntar disponibilidad» (consultar: true) no llevan precio ni Product, solo BreadcrumbList;
   - el contenido básico en el HTML (#estatico), para los buscadores y asistentes de IA que no ejecutan JavaScript.
     Con JavaScript se oculta y la tienda se carga encima, en la misma dirección.
   404.html: copia de la tienda para las direcciones sin página propia (ej.: /RocketFix/buscar/iphone/); la tienda lee la
   dirección y muestra esa página (o su «No la encontramos»).
   También escribe sitemap.xml. Solo usa datos reales del catálogo: no declara disponibilidad, garantías ni calificaciones.
   Uso: node scripts/paginas-estaticas.mjs  (lo corre `npm run build`) */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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

// ---------- Lo primero que se ve se pide desde el HTML ----------
// La foto más grande de la página (la del producto, o la primera de la vitrina en la portada) antes solo se pedía cuando
// la tienda terminaba de cargar y armarse. Pedirla desde el HTML la adelanta cerca de un segundo en una red lenta.
const precargaFoto = ruta => `<link rel="preload" as="image" href="${BASE}${ruta}" fetchpriority="high">`;
// La página de producto va en un archivo aparte (Producto-….js): también se pide de una vez
const ARCHIVO_PRODUCTO = readdirSync(join(DIST, "assets")).find(f => /^Producto-.+\.js$/.test(f));
const precargaProducto = ARCHIVO_PRODUCTO ? `<link rel="modulepreload" href="${BASE}assets/${ARCHIVO_PRODUCTO}">` : "";
// Cada producto baja solo su descripción (descripciones/<id>.json, ver vite.config.ts): también se pide de una vez
const precargaDescripcion = p => DESCRIPCIONES[p.id] ? `<link rel="preload" as="fetch" crossorigin="anonymous" href="${BASE}descripciones/${p.id}.json">` : "";
// Las direcciones con # (las que usa la tienda por dentro) abren todas index.html: ahí se decide con un guion corto.
// Solo adivina la foto de un producto si todas siguen la regla fotos/<id>.jpg (si un día cambia, deja de hacerlo)
const FOTOS_POR_REGLA = PRODUCTOS.every(p => p.imagen === `fotos/${p.id}.jpg` && /^[\w-]+$/.test(p.id));
const primeraVitrina = (CONTENIDO.vitrina ?? []).map(id => PRODUCTOS.find(p => p.id === id)).find(p => p?.imagen && !p.consultar);
const AL_ABRIR = `<script>(function(){var h=location.hash.replace(/^#\\/?/,""),m=${FOTOS_POR_REGLA ? "/^p\\/([\\w-]+)$/.exec(h)" : "null"},` +
  `f=!h||h=="inicio"?${JSON.stringify(primeraVitrina?.imagen ?? "")}:m?"fotos/"+m[1]+".jpg":"";` +
  `function pedir(rel,ruta,foto){var l=document.createElement("link");l.rel=rel;l.href=${JSON.stringify(BASE)}+ruta;if(foto){l.as="image";l.setAttribute("fetchpriority","high")}document.head.appendChild(l)}` +
  `if(f)pedir("preload",f,1);${ARCHIVO_PRODUCTO ? `if(m)pedir("modulepreload",${JSON.stringify("assets/" + ARCHIVO_PRODUCTO)});` : ""}` +
  `if(m&&${FOTOS_POR_REGLA}){var d=document.createElement("link");d.rel="preload";d.as="fetch";d.crossOrigin="anonymous";d.href=${JSON.stringify(BASE)}+"descripciones/"+m[1]+".json";document.head.appendChild(d)}})()</script>`;

function pagina({ ruta, titulo, descripcion, imagen, altImagen, jsonld, cuerpo, precarga = "" }) {
  const url = SITIO + ruta;
  let h = PLANTILLA
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(descripcion)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(titulo)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(descripcion)}`)
    // Las de X (twitter:…) van iguales a las de Open Graph: si no, X mostraría las de la portada
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(titulo)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(descripcion)}`);
  if (imagen) {
    // Fotos de producto: cuadradas de 800 x 800
    h = h.replace(/(<meta property="og:image" content=")[^"]*/, `$1${abs(imagen)}`)
      .replace(/(<meta property="og:image:type" content=")[^"]*/, "$1image/jpeg")
      .replace(/(<meta property="og:image:width" content=")[^"]*/, "$1800")
      .replace(/(<meta property="og:image:height" content=")[^"]*/, "$1800")
      .replace(/(<meta property="og:image:alt" content=")[^"]*/, `$1${esc(altImagen)}`)
      .replace(/(<meta name="twitter:image" content=")[^"]*/, `$1${abs(imagen)}`);
  }
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": jsonld }).replace(/</g, "\\u003c")}</script>`;
  h = h.replace("</head>", `${precarga}${OCULTAR}${ld}</head>`)
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
const precioLista = p => p.consultar ? "preguntar disponibilidad" : `${p.opciones.length > 1 ? "desde " : ""}${dinero(desde(p))}`;
const listaProductos = ps => `<ul>${ps.map(p => `<li><a href="${BASE}${rutaProducto(p)}">${esc(p.nombre)}</a> · ${esc(precioLista(p))}</li>`).join("")}</ul>`;
const CONDICION = { Nuevo: "https://schema.org/NewCondition", CPO: "https://schema.org/RefurbishedCondition", Usado: "https://schema.org/UsedCondition" };

// ---------- Envío y devoluciones en los datos estructurados (Google los pide para las fichas de comerciante) ----------
// Solo datos que ya publica la tienda: el costo de envío y desde cuánto es gratis (config.json → envios), y el derecho de
// retracto de la página «Cambios y devoluciones» (5 días hábiles desde la entrega, envío de vuelta a cargo del cliente,
// artículo 47 de la Ley 1480). Se declaran 5 días aunque 5 hábiles son más: así nunca se promete más de lo que dice la página.
const envioLd = (zona, precio) => ({
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: precio >= CONFIG.envios[zona].gratisDesde ? 0 : CONFIG.envios[zona].costo, currency: "COP" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "CO", ...(zona === "bogota" ? { addressRegion: "DC" } : {}) }
});
const devolucionLd = {
  "@type": "MerchantReturnPolicy", applicableCountry: "CO",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow", merchantReturnDays: 5,
  returnMethod: "https://schema.org/ReturnByMail", returnFees: "https://schema.org/ReturnShippingFees",
  merchantReturnLink: SITIO + "cambios-y-devoluciones/"
};

const urls = [];
/** Idea 65: fotos de cada página de producto, para el mapa del sitio (Google Imágenes) */
const FOTOS_URL = {};

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
    : { "@type": "Offer", priceCurrency: "COP", price: precio, url: SITIO + ruta, seller: { "@id": ORGANIZACION },
        shippingDetails: [envioLd("bogota", precio), envioLd("nacional", precio)], hasMerchantReturnPolicy: devolucionLd };
  if (condicion) oferta.itemCondition = condicion;
  const producto = {
    "@type": "Product", "@id": SITIO + ruta + "#producto", name: p.nombre, sku: p.id, description: d.resumen,
    ...(fotos.length ? { image: fotos.map(abs) } : {}),
    ...(p.marca ? { brand: { "@type": "Brand", name: p.marca } } : {}),
    ...(p.categoria ? { category: nombreCat[p.categoria] } : {}),
    offers: oferta
  };
  const camino = [["Inicio", ""], [VISTAS[vista] ?? vista, rutaVista(vista)], [p.nombre, null]];
  const consultar = Boolean(p.consultar);
  const precioTxt = consultar ? "preguntar disponibilidad" : `${varias ? "desde " : ""}${dinero(precio)}`;
  const descripcion = recortar(`${p.nombre}${distintivo[p.id] ? ` (${distintivo[p.id]})` : ""}${consultar ? ":" : ""} ${precioTxt}${p.estado !== "Nuevo" ? ` (${ESTADOS[p.estado] ?? p.estado})` : ""}. Domicilio en Bogotá y envíos a todo Colombia. Compra con asesoría por WhatsApp en ${CONFIG.nombre}.`, 160);
  const cuerpo = [
    migasHtml(camino),
    `<h1>${esc(p.nombre)}</h1>`,
    etiquetaDe(p) ? `<p>${esc(etiquetaDe(p))}</p>` : "",
    fotos[0] ? `<img src="${BASE}${fotos[0]}" alt="${esc(p.nombre)}" width="800" height="800">` : "",
    consultar ? `<p><strong>Preguntar disponibilidad</strong></p>` : `<p><strong>${esc(precioTxt[0].toUpperCase() + precioTxt.slice(1))}</strong> (pesos colombianos)</p>`,
    varias ? `<ul>${p.opciones.map(o => `<li>${esc(o.nombre)}${consultar ? "" : `: ${esc(dinero(o.precio))}`}</li>`).join("")}</ul>` : "",
    p.nota ? `<p>${esc(p.nota)}</p>` : "",
    `<h2>Descripción</h2><p>${esc(d.resumen)}</p>`,
    `<h2>Características</h2><dl>${d.filas.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`,
    d.incluye ? `<h2>Qué incluye la caja</h2><p>${esc(d.incluye)}</p>` : "",
    consultar
      ? `<p><a href="${wa(`Hola ${CONFIG.nombre}, me interesa ${p.nombre}. ¿Está disponible y qué precio tiene?`)}">Preguntar disponibilidad por WhatsApp</a>.</p>`
      : `<p><a href="${wa(`Hola ${CONFIG.nombre}, me interesa ${p.nombre} (${dinero(precio)}). ¿Está disponible?`)}">Preguntar por WhatsApp</a>. Antes de cualquier pago te confirmamos disponibilidad.</p>`,
    contacto
  ].join("");
  // Sin precio publicado no hay oferta que declarar: Google pide precio en Product, así que solo van las migas
  const jsonld = consultar ? [migas(camino)] : [producto, migas(camino)];
  FOTOS_URL[SITIO + ruta] = fotos.slice(0, 10).map(abs);
  urls.push(pagina({ ruta, titulo: tituloProducto(p), descripcion, imagen: fotos[0], altImagen: p.nombre, jsonld, cuerpo, precarga: (fotos[0] ? precargaFoto(fotos[0]) : "") + precargaProducto + precargaDescripcion(p) }));
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

// ---------- Políticas: garantía, cambios y devoluciones (retracto) y datos personales ----------
{
  const POLITICAS = leer("politicas.json");
  const fijos = { whatsapp: CONFIG.whatsappVisible, nombre: CONFIG.nombre };
  // Un dato sin llenar sale como [etiqueta], igual que en la tienda
  const legal = t => esc(t.replace(/\{(\w+)\}/g, (_, k) => fijos[k] ?? POLITICAS.datos[k]?.valor ?? `[${POLITICAS.datos[k]?.etiqueta ?? k}]`));
  for (const p of POLITICAS.paginas) {
    const camino = [["Inicio", ""], [p.titulo, null]];
    const texto = p.secciones.map(s => `<h2>${esc(s.titulo)}</h2>` + s.bloques.map(b => {
      if (typeof b === "string") return `<p>${legal(b)}</p>`;
      const tag = b.numerada ? "ol" : "ul";
      return `<${tag}>${b.lista.map(x => `<li>${legal(x)}</li>`).join("")}</${tag}>`;
    }).join("")).join("");
    urls.push(pagina({ ruta: `${p.id}/`, titulo: `${p.titulo} · ${CONFIG.nombre}`, descripcion: recortar(p.lead, 160), jsonld: [migas(camino)], cuerpo: migasHtml(camino) + `<h1>${esc(p.titulo)}</h1><p>${esc(p.lead)}</p>${texto}` + contacto }));
  }
}

// ---------- Páginas de ayuda (12/11/2026: src/data/ayuda.json) ----------
// Mismos textos de la tienda; los datos ({envioBogota}, {horario}…) se llenan con config.json, igual que en src/lib/ayuda.ts
const AYUDA = leer("ayuda.json");
const ANCLAS_INICIO = ["servicios", "contacto", "orden", "categorias", "calificaciones", "como-comprar", "regalos", "ideas-regalo", "presupuesto", "marcas", "envios", "tu-celular", "recientes"];
const horaTxt = hhmm => { const [h = 0, m = 0] = hhmm.split(":").map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString(CONFIG.idioma, { hour: "numeric", minute: "2-digit" }); };
const VALORES_AYUDA = {
  envioBogota: dinero(CONFIG.envios.bogota.costo), gratisBogota: dinero(CONFIG.envios.bogota.gratisDesde),
  envioNacional: dinero(CONFIG.envios.nacional.costo), gratisNacional: dinero(CONFIG.envios.nacional.gratisDesde),
  pagosBogota: lista(CONFIG.pagos.bogota), pagosNacional: lista(CONFIG.pagos.nacional),
  domicilio: CONFIG.domicilio, envio: CONFIG.envio, whatsapp: CONFIG.whatsappVisible,
  horario: CONFIG.horario.filter(t => t.abre && t.cierra).map(t => `${t.etiqueta}, de ${horaTxt(t.abre)} – ${horaTxt(t.cierra)}`).join("; ")
};
const rellenar = t => t.replace(/\{(\w+)\}/g, (todo, k) => VALORES_AYUDA[k] ?? todo);
const hrefRuta = r => /^https?:/.test(r) ? r : ANCLAS_INICIO.includes(r) ? `${BASE}#${r}` : `${BASE}${r}/`;
/** Texto con [enlaces](ruta) a HTML (escapando todo lo demás) */
const conEnlaces = t => {
  const s = rellenar(t);
  let out = "", i = 0;
  for (const m of s.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    out += esc(s.slice(i, m.index)) + `<a href="${esc(hrefRuta(m[2]))}">${esc(m[1])}</a>`;
    i = m.index + m[0].length;
  }
  return out + esc(s.slice(i));
};
const planoAyuda = t => rellenar(t).replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");
const INFO_RUTAS = new Set();
for (const pa of AYUDA.paginas) {
  const camino = [["Inicio", ""], [pa.menu, null]];
  let contenido = "";
  if (pa.secciones) {
    contenido = pa.secciones.map(s => `<h2>${esc(s.titulo)}</h2>` + (s.parrafos ?? []).map(t => `<p>${conEnlaces(t)}</p>`).join("") +
      (s.lista ? `<ul>${s.lista.map(t => `<li>${conEnlaces(t)}</li>`).join("")}</ul>` : "")).join("");
  } else if (pa.id === "preguntas-frecuentes") {
    const temas = [...new Set(AYUDA.faq.map(x => x.tema))];
    contenido = temas.map(t => `<h2>${esc(t)}</h2>` + AYUDA.faq.filter(x => x.tema === t).map(x => `<h3>${esc(x.p)}</h3><p>${conEnlaces(x.r)}</p>`).join("")).join("");
  } else if (pa.id === "glosario") {
    contenido = `<dl>${AYUDA.glosario.map(g => `<dt>${esc(g.t)}</dt><dd>${esc(g.d)}</dd>`).join("")}</dl>`;
  } else if (pa.id === "busca-por-uso") {
    contenido = AYUDA.usos.map(u => `<h2 id="${esc(u.id)}">${esc(u.titulo)}</h2><p>${esc(u.texto)}</p><ul>${u.tipos.map(tp => {
      const [t, c] = tp.split(":");
      const vista = TIENDA_VISTA[t];
      return `<li><a href="${BASE}${rutaVista(vista)}${c ? `?tipo=${encodeURIComponent(c)}` : ""}">${esc(c ? nombreCat[c] ?? c : VISTAS[vista] ?? vista)}</a></li>`;
    }).join("")}</ul>`).join("");
  } else if (pa.id === "todas-las-marcas") {
    const todas = Object.entries(PRODUCTOS.reduce((a, p) => (p.marca && (a[p.marca] = (a[p.marca] ?? 0) + 1), a), {})).sort((a, b) => a[0].localeCompare(b[0], "es"));
    // Solo las marcas con página propia (3 productos o más) van con enlace: las demás abrirían 404.html
    contenido = `<ul>${todas.map(([m, n]) => `<li>${MARCAS.includes(m) ? `<a href="${BASE}${rutaMarca(m)}">${esc(m)}</a>` : esc(m)} (${n})</li>`).join("")}</ul>`;
  }
  const ruta = `${pa.id}/`;
  INFO_RUTAS.add(ruta);
  const jsonld = [migas(camino)];
  urls.push(pagina({ ruta, titulo: `${pa.titulo} · ${CONFIG.nombre}`, descripcion: recortar(planoAyuda(pa.lead), 160), jsonld, cuerpo: migasHtml(camino) + `<h1>${esc(pa.titulo)}</h1><p>${esc(planoAyuda(pa.lead))}</p>${contenido}` + contacto }));
}

// ---------- Portada: la tienda y el sitio, más enlaces a todo ----------
{
  const tiendaLd = {
    "@type": "OnlineStore", "@id": ORGANIZACION, name: CONFIG.nombre, url: SITIO, logo: abs("apple-touch-icon.png"),
    telephone: CONFIG.whatsappVisible, areaServed: { "@type": "Country", name: "Colombia" },
    contactPoint: { "@type": "ContactPoint", telephone: CONFIG.whatsappVisible, contactType: "customer service", availableLanguage: "es", areaServed: "CO" },
    hasMerchantReturnPolicy: devolucionLd
  };
  const sitioLd = { "@type": "WebSite", "@id": SITIO + "#sitio", name: CONFIG.nombre, url: SITIO, inLanguage: "es-CO", publisher: { "@id": ORGANIZACION } };
  const secciones = Object.entries(TIENDA_VISTA).filter(([t]) => PRODUCTOS.some(p => p.tienda === t));
  const cuerpo = `<h1>${esc(CONFIG.nombre)}: hacemos despegar tu tecnología</h1>` +
    `<p>Celulares, computadores, gaming y accesorios con entrega a domicilio. Compra con asesoría por WhatsApp y solicita servicio técnico para tu hogar o negocio.</p>` +
    `<h2>Secciones</h2><ul>${secciones.map(([, v]) => `<li><a href="${BASE}${rutaVista(v)}">${esc(VISTAS[v] ?? v)}</a></li>`).join("")}</ul>` +
    `<h2>Marcas</h2><ul>${MARCAS.map(m => `<li><a href="${BASE}${rutaMarca(m)}">${esc(m)}</a></li>`).join("")}</ul>` +
    `<h2>Servicio técnico</h2><ul>${ARTICULOS.map(a => `<li><a href="${BASE}${a.id}/">${esc(a.titulo)}</a></li>`).join("")}</ul>` +
    `<h2>Ayuda</h2><ul>${AYUDA.paginas.map(pa => `<li><a href="${BASE}${pa.id}/">${esc(pa.menu)}</a></li>`).join("")}</ul>` + contacto;
  // La portada conserva su título, descripción e imagen; solo se agregan los datos estructurados y el contenido
  const h = PLANTILLA.replace("</head>", `${AL_ABRIR}${OCULTAR}<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [tiendaLd, sitioLd] }).replace(/</g, "\\u003c")}</script></head>`)
    .replace(/(<div id="root"><\/div>)/, `$1<div id="estatico" class="contenedor py-8">${cuerpo}</div>`);
  writeFileSync(join(DIST, "index.html"), h);
  urls.unshift(SITIO);
  // 404.html: la tienda sin contenido estático ni dirección canónica, y sin indexar
  writeFileSync(join(DIST, "404.html"), PLANTILLA
    .replace(/<link rel="canonical"[^>]*>\s*/, "")
    .replace("</head>", `<meta name="robots" content="noindex">${OCULTAR}</head>`));
}

// ---------- Mapa del sitio ----------
// lastmod honesto: la fecha del último cambio guardado (commit) de los datos de cada página. Antes iba la fecha del día
// en las 1.131 direcciones en cada publicación, y Google deja de creerle a un mapa que dice que todo cambió siempre.
// Necesita el historial de git (en publicar.yml, checkout con fetch-depth: 0); si no lo hay, la fecha simplemente no va.
const fechaDe = (...archivos) => {
  try { return execFileSync("git", ["log", "-1", "--format=%cs", "--", ...archivos.map(a => `src/data/${a}`)], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || null; }
  catch { return null; }
};
const masNueva = (...fechas) => fechas.filter(Boolean).sort().at(-1) ?? null;
const FECHAS = {
  catalogo: fechaDe("productos.json", "descripciones.json", "galerias.json", "categorias.json", "cabeceras.json"),
  textos: fechaDe("articulos-texto.json", "contenido.json", "ayuda.json"),
  politicas: fechaDe("politicas.json", "config.json")
};
const POLITICAS_IDS = new Set(leer("politicas.json").paginas.map(p => `${p.id}/`));
const ARTICULOS_IDS = new Set(["blog/", ...ARTICULOS.map(a => `${a.id}/`)]);
const fechaUrl = u => {
  const ruta = u.slice(SITIO.length);
  if (!ruta) return masNueva(...Object.values(FECHAS));
  if (POLITICAS_IDS.has(ruta)) return FECHAS.politicas;
  if (ARTICULOS_IDS.has(ruta) || INFO_RUTAS.has(ruta)) return FECHAS.textos;
  return FECHAS.catalogo;
};
const imagenesXml = u => (FOTOS_URL[u] ?? []).map(f => `<image:image><image:loc>${esc(f)}</image:loc></image:image>`).join("");
writeFileSync(join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(u => { const f = fechaUrl(u); return `  <url><loc>${u}</loc>${f ? `<lastmod>${f}</lastmod>` : ""}${imagenesXml(u)}</url>`; }).join("\n")}\n</urlset>\n`);
if (!FECHAS.catalogo) console.warn("sitemap.xml sin lastmod: no se encontró el historial de git");

// ---------- Idea 67: llms.txt (resumen de la tienda para asistentes de IA; https://llmstxt.org) ----------
{
  const secciones = Object.entries(TIENDA_VISTA).filter(([t]) => PRODUCTOS.some(p => p.tienda === t));
  const politicas = leer("politicas.json").paginas;
  const linea = (texto, ruta, nota = "") => `- [${texto}](${SITIO}${ruta})${nota ? `: ${nota}` : ""}`;
  const txt = [
    `# ${CONFIG.nombre}`, "",
    `> Tienda de tecnología en Bogotá, Colombia: celulares, computadores, gaming, componentes y accesorios, con domicilio en Bogotá y envíos a todo Colombia. Pedidos y asesoría por WhatsApp (${CONFIG.whatsappVisible}). Precios en pesos colombianos (COP); la disponibilidad se confirma por WhatsApp antes de cualquier pago.`, "",
    `Servicio técnico: reparación de celulares y computadores, e instalación de cámaras de seguridad.`, "",
    "## Secciones de la tienda",
    ...secciones.map(([t, v]) => linea(VISTAS[v] ?? v, rutaVista(v), `${PRODUCTOS.filter(p => p.tienda === t).length} productos`)), "",
    "## Ayuda",
    ...AYUDA.paginas.map(pa => linea(pa.menu, `${pa.id}/`, planoAyuda(pa.lead))), "",
    "## Servicio técnico",
    ...ARTICULOS.map(a => linea(a.titulo, `${a.id}/`, a.resumen)), "",
    "## Políticas",
    ...politicas.map(p => linea(p.titulo, `${p.id}/`)), "",
    "## Optional",
    linea("Mapa del sitio (todas las páginas de producto)", "sitemap.xml"),
    ""
  ].join("\n");
  writeFileSync(join(DIST, "llms.txt"), txt);
}

// ---------- Idea 66: feed de productos para Google Merchant Center (apagado hasta que se active) ----------
// Merchant Center pide declarar si cada producto está «en existencia». La tienda no lo publica (lo confirma por WhatsApp),
// así que el feed solo se escribe con FEED_GOOGLE=1, cuando se decida abrir la cuenta y cómo declarar la disponibilidad.
if (process.env.FEED_GOOGLE === "1") {
  const COND_FEED = { Nuevo: "new", CPO: "refurbished", "Open box": "used", Usado: "used" };
  const items = PRODUCTOS.filter(p => !p.consultar && p.imagen).map(p => {
    const fotos = [p.imagen, ...(GALERIAS[p.id] ?? [])].map(abs);
    return `<item><g:id>${esc(p.id)}</g:id><title>${esc(recortar(p.nombre, 150))}</title><description>${esc(recortar(armarDescripcion(p).resumen, 4900))}</description>` +
      `<link>${SITIO}${rutaProducto(p)}</link><g:image_link>${esc(fotos[0])}</g:image_link>${fotos.slice(1, 10).map(f => `<g:additional_image_link>${esc(f)}</g:additional_image_link>`).join("")}` +
      `<g:price>${desde(p)} COP</g:price><g:availability>in_stock</g:availability><g:condition>${COND_FEED[p.estado] ?? "new"}</g:condition>` +
      `${p.marca ? `<g:brand>${esc(p.marca)}</g:brand>` : "<g:identifier_exists>no</g:identifier_exists>"}${p.categoria ? `<g:product_type>${esc(nombreCat[p.categoria] ?? p.categoria)}</g:product_type>` : ""}</item>`;
  });
  writeFileSync(join(DIST, "feed-google.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>${esc(CONFIG.nombre)}</title><link>${SITIO}</link><description>Catálogo de ${esc(CONFIG.nombre)}</description>\n${items.join("\n")}\n</channel></rss>\n`);
  console.log(`feed-google.xml: ${items.length} productos`);
}

// ---------- Idea 79: política de seguridad de contenido (CSP) en cada página ----------
// GitHub Pages no deja poner encabezados, así que va como <meta>. Solo se ejecutan los scripts de la tienda, los de
// https (Bold carga los suyos) y los scripts en línea de estas páginas (por su huella sha256): un script inyectado en la
// página no corre. Las imágenes, estilos, marcos y conexiones quedan libres dentro de https (fotos de proveedores, Bold).
{
  const { createHash } = await import("node:crypto");
  const todas = [];
  const recorrer = dir => { for (const f of readdirSync(dir, { withFileTypes: true })) { const r = join(dir, f.name); if (f.isDirectory()) recorrer(r); else if (f.name.endsWith(".html")) todas.push(r); } };
  recorrer(DIST);
  for (const archivo of todas) {
    let h = readFileSync(archivo, "utf8");
    const huellas = [...h.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => `'sha256-${createHash("sha256").update(m[1], "utf8").digest("base64")}'`);
    const csp = [
      "default-src 'self'", `script-src 'self' ${[...new Set(huellas)].join(" ")} https:`, "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: blob: https:", "font-src 'self' data: https:", "connect-src 'self' https:", "frame-src https:",
      "media-src 'self' https:", "worker-src 'self'", "manifest-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self' https:"
    ].join("; ");
    h = h.replace(/(<meta charset="[^"]*"\s*\/?>)/i, `$1\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`);
    writeFileSync(archivo, h);
  }
  console.log(`CSP en ${todas.length} páginas`);
}
console.log(`Páginas estáticas: ${urls.length} (productos ${PRODUCTOS.length}, marcas ${MARCAS.length}, ayuda ${AYUDA.paginas.length}) · sitemap.xml y llms.txt listos`);
