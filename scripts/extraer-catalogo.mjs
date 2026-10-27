// Extrae el catálogo y el contenido de la tienda original (legacy/index.html) a archivos JSON en src/data.
// No modifica legacy/index.html. Se puede volver a correr cuando cambie el original: npm run catalogo
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";

// (git puede entregar el archivo con saltos de línea de Windows)
const html = readFileSync("legacy/index.html", "utf8").replace(/\r\n/g, "\n");
const salida = "src/data";
mkdirSync(salida, { recursive: true });
const guardar = (nombre, datos) => writeFileSync(`${salida}/${nombre}.json`, JSON.stringify(datos, null, 1) + "\n");

// 1. Bloque de datos: desde <script> hasta "Funcionamiento de la página" (configuración, categorías, productos,
//    paquetes, artículos, servicios, galerías y descripciones). Son solo declaraciones, sin acceso al DOM.
const inicio = html.indexOf("<script>") + "<script>".length;
const fin = html.indexOf("/* ==========================================================================\n   Funcionamiento de la página");
if (inicio < 8 || fin < 0) throw new Error("No se encontró el bloque de datos en legacy/index.html");
let codigo = html.slice(inicio, fin);

// 2. Tablas del código de funcionamiento que también son datos (se copian tal cual)
const tomar = nombre => {
  const m = html.match(new RegExp(`const ${nombre} = ([\\s\\S]*?);\\n`));
  if (!m) throw new Error(`No se encontró ${nombre}`);
  return `const ${nombre} = ${m[1]};\n`;
};
codigo += ["ILUS_CATEGORIA", "INCLUYE", "ESTADOS", "MAS_VENDIDOS", "BUSQUEDAS_POPULARES", "SINONIMOS", "TIENDA_VISTA", "VISTAS"].map(tomar).join("");
codigo += `;({ CONFIG, PRODUCTOS, PAQUETES, ARTICULOS, SERVICIOS, ILUS, GALERIAS, DESCRIPCIONES, ILUS_CATEGORIA, INCLUYE, ESTADOS,
  MAS_VENDIDOS, BUSQUEDAS_POPULARES, SINONIMOS, TIENDA_VISTA, VISTAS,
  CATEGORIAS: { pc: CATEGORIAS_PC, comp: CATEGORIAS_COMP, per: CATEGORIAS_PER, con: CATEGORIAS_CON, tv: CATEGORIAS_TV, tab: CATEGORIAS_TAB,
    rel: CATEGORIAS_REL, aud: CATEGORIAS_AUD, par: CATEGORIAS_PAR, acc: CATEGORIAS_ACC, mov: CATEGORIAS_MOV } })`;
const d = vm.runInNewContext(codigo, {}, { timeout: 5000 });

// 3. Productos: se conservan todos los campos originales; se agregan "opciones" (siempre en lista) y "estado" con su valor por defecto.
//    El precio de un producto sin versiones queda como una sola opción sin nombre, igual que en la tienda original.
const productos = d.PRODUCTOS.map(p => {
  const original = { ...p };
  const opciones = (p.opciones || [["", p.precio]]).map(([nombre, precio]) => ({ nombre, precio }));
  delete original.opciones; delete original.precio;
  return { ...original, estado: p.estado || "Nuevo", specs: p.specs || [], opciones };
});

guardar("config", d.CONFIG);
guardar("categorias", d.CATEGORIAS);
guardar("productos", productos);
guardar("descripciones", d.DESCRIPCIONES);
guardar("galerias", d.GALERIAS);
guardar("contenido", {
  paquetes: d.PAQUETES, articulos: d.ARTICULOS, servicios: d.SERVICIOS, incluye: d.INCLUYE, estados: d.ESTADOS,
  masVendidos: d.MAS_VENDIDOS, busquedasPopulares: d.BUSQUEDAS_POPULARES, sinonimos: d.SINONIMOS,
  tiendaVista: d.TIENDA_VISTA, vistas: d.VISTAS, ilusCategoria: d.ILUS_CATEGORIA
});
guardar("ilustraciones", d.ILUS);

// 4. Texto de las secciones: introducción y nota de cada tienda, y el cuerpo de cada artículo del blog
const seccion = vista => {
  const i = html.indexOf(`<section data-view="${vista}"`);
  return i < 0 ? "" : html.slice(i, html.indexOf("</section>\n", html.indexOf('class="band"', i)) + 10);
};
const limpiar = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const cabeceras = {};
for (const vista of Object.keys(d.VISTAS)) {
  const s = seccion(vista);
  if (!s) continue;
  const lead = (s.match(/<p class="lead">([\s\S]*?)<\/p>/) || [])[1];
  const nota = s.match(/<div class="head-note"[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<p>([\s\S]*?)<\/p>\s*<a ([^>]*)>([\s\S]*?)<\/a>/);
  cabeceras[vista] = {
    titulo: limpiar((s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || ""),
    lead: lead ? limpiar(lead) : "",
    nota: nota ? {
      titulo: limpiar(nota[1]), texto: limpiar(nota[2]), enlace: limpiar(nota[4]),
      href: (nota[3].match(/href="#([^"]+)"/) || [])[1] || null,
      whatsapp: (nota[3].match(/data-wa-msg="([^"]+)"/) || [])[1] || (nota[3].includes("data-wa") ? "" : null)
    } : null
  };
}
guardar("cabeceras", cabeceras);

const cuerpos = {};
for (const a of d.ARTICULOS) {
  const s = seccion(a.id);
  const m = s.match(/<article class="prose">([\s\S]*?)<\/article>/);
  if (!m) throw new Error(`Sin texto: ${a.id}`);
  cuerpos[a.id] = m[1].replace(/\n\s+/g, "\n").trim();
}
guardar("articulos-texto", cuerpos);

// 5. Logos de formas de pago del pie de página (vienen incrustados como data URI): se guardan como archivos
const pagos = [];
const lista = html.slice(html.indexOf('<ul class="pagos-lista"'), html.indexOf("</ul>", html.indexOf('<ul class="pagos-lista"')));
mkdirSync("public/pagos", { recursive: true });
for (const li of lista.split("<li").slice(1)) {
  const nombre = limpiar(("<li" + li).replace(/<img[^>]*>/g, "").replace(/<svg[\s\S]*?<\/svg>/g, "")) || ((li.match(/alt="([^"]+)"/) || [])[1] || "");
  const img = li.match(/src="data:image\/(svg\+xml|png|jpeg);base64,([^"]+)"/);
  const svg = li.match(/<svg[\s\S]*?<\/svg>/);
  let archivo = null;
  if (img) {
    const ext = img[1] === "svg+xml" ? "svg" : img[1] === "jpeg" ? "jpg" : img[1];
    archivo = `pagos/${nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.${ext}`;
    writeFileSync(`public/${archivo}`, Buffer.from(img[2], "base64"));
  }
  pagos.push({ nombre, archivo, icono: svg && !img ? svg[0] : null, alt: (li.match(/alt="([^"]*)"/) || [])[1] ?? null });
}
const notaPagos = (html.match(/<p class="pagos-nota">([\s\S]*?)<\/p>/) || [])[1];
guardar("pagos", { lista: pagos, nota: notaPagos ? limpiar(notaPagos) : "" });

console.log(`productos: ${productos.length} · descripciones: ${Object.keys(d.DESCRIPCIONES).length} · galerías: ${Object.keys(d.GALERIAS).length}` +
  ` · artículos: ${Object.keys(cuerpos).length} · cabeceras: ${Object.keys(cabeceras).length} · formas de pago: ${pagos.length}`);
