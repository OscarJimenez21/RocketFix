/* Acceso tipado al catálogo extraído de la tienda original (los JSON los genera scripts/extraer-catalogo.mjs).
   Aquí no se cambian datos: solo se agregan índices y textos derivados para buscar y mostrar.
   La lista de productos llega aparte (datos/productos.json, ver datosAparte en vite.config.ts): al compilar, este import
   se cambia por lo que src/main.tsx dejó en globalThis.__RF_PRODUCTOS. Las galerías están en src/lib/galerias.ts */
import productosJson from "./productos.json";
import categoriasJson from "./categorias.json";
import configJson from "./config.json";
import contenidoJson from "./contenido.json";
import cabecerasJson from "./cabeceras.json";
import pagosJson from "./pagos.json";
import resenasJson from "./resenas.json";
import logosMarcasJson from "./logos-marcas.json";
import llegadasJson from "./llegadas.json";
import type { Articulo, Cabecera, Categoria, Config, FormaPago, Paquete, Producto, Resena, Servicio, TiendaId } from "../types";
import { norm } from "../lib/formato";

export const CONFIG = configJson as Config;
export const PRODUCTOS = productosJson as Producto[];
export const CATEGORIAS = categoriasJson as Record<Exclude<TiendaId, "cel">, Categoria[]>;
export const CABECERAS = cabecerasJson as Record<string, Cabecera>;
export const PAGOS = pagosJson as { lista: FormaPago[]; nota: string };
/** Calificaciones de clientes que autorizaron publicarlas (las agrega Rocket Fix; la página no recibe datos) */
export const RESENAS = resenasJson as Resena[];
/** Logo de cada marca (public/marcas, fondo transparente y 56 px de alto); las marcas sin logo se muestran con su nombre */
export const LOGOS_MARCAS = logosMarcasJson as Record<string, string>;

const contenido = contenidoJson as {
  paquetes: Paquete[];
  articulos: Articulo[];
  servicios: Servicio[];
  incluye: Record<string, string>;
  estados: Record<string, string>;
  masVendidos: string[];
  vitrina: string[];
  busquedasPopulares: string[];
  sinonimos: Record<string, string[]>;
  tiendaVista: Record<TiendaId, string>;
  vistas: Record<string, string>;
  ilusCategoria: Record<string, string>;
};
export const PAQUETES = contenido.paquetes;
export const ARTICULOS = contenido.articulos;
export const SERVICIOS = contenido.servicios;
export const INCLUYE = contenido.incluye;
export const ESTADOS = contenido.estados;
export const MAS_VENDIDOS = contenido.masVendidos;
/** Productos de la vitrina de la portada, en orden. Están en contenido.json porque la página estática de la portada
    (scripts/paginas-estaticas.mjs) también los lee: así el navegador empieza a bajar la primera foto antes de que cargue la tienda */
export const VITRINA = contenido.vitrina;
export const BUSQUEDAS_POPULARES = contenido.busquedasPopulares;
export const SINONIMOS = contenido.sinonimos;
export const VISTAS = contenido.vistas;
/** Sección → nombre de su página (ej.: cel → "celulares") */
export const TIENDA_VISTA = contenido.tiendaVista;
/** Página → sección (ej.: "celulares" → cel) */
export const VISTA_TIENDA = Object.fromEntries(Object.entries(TIENDA_VISTA).map(([t, v]) => [v, t])) as Record<string, TiendaId>;

export const porId: Record<string, Producto> = Object.fromEntries(PRODUCTOS.map(p => [p.id, p]));
export const nombreCat: Record<string, string> = Object.fromEntries(Object.values(CATEGORIAS).flat().map(c => [c.id, c.nombre]));
/** Orden de los tipos de producto (para "Recomendados") */
export const ORDEN_CAT: Record<string, number> = Object.fromEntries(Object.values(CATEGORIAS).flat().map((c, i) => [c.id, i]));

export const deTienda = (t: TiendaId) => PRODUCTOS.filter(p => p.tienda === t);
export const desde = (p: Producto) => Math.min(...p.opciones.map(o => o.precio));
/** Rótulo del precio (igual que en el catálogo en PDF): «Desde» solo si las versiones cambian de precio; si no, «Precio» */
export const rotuloPrecio = (p: Producto) => (new Set(p.opciones.map(o => o.precio)).size > 1 ? "Desde" : "Precio");
/** Fecha en que cada producto entró al catálogo (AAAA-MM-DD), sacada del historial de productos.json. Solo están los que
    llegaron después del 28/10/2026; al agregar productos nuevos, se agregan aquí con la fecha del día */
const LLEGADAS = llegadasJson as Record<string, string>;
/** Cuántos días lleva la etiqueta «Recién llegado» un producto después de entrar al catálogo */
export const DIAS_RECIEN_LLEGADO = 45;
/** «Recién llegado» (no «Nuevo»: «Nuevo» es el estado del equipo, frente a usado o CPO) */
export const recienLlegado = (p: Producto, hoy = Date.now()) => {
  const f = LLEGADAS[p.id];
  return Boolean(f) && !p.consultar && hoy - Date.parse(`${f}T00:00:00-05:00`) < DIAS_RECIEN_LLEGADO * 864e5;
};
/** Para ordenar: primero los productos con precio, al final los de «Preguntar disponibilidad» (el resto del orden se mantiene) */
export const conPrecioPrimero = (a: Producto, b: Producto) => Number(Boolean(a.consultar)) - Number(Boolean(b.consultar));
/** Mensaje de WhatsApp para un producto sin precio publicado */
export const textoConsulta = (p: Producto, nombreOpcion = "") => `Hola ${CONFIG.nombre}, me interesa ${nombreItem(p, nombreOpcion)}. ¿Está disponible y qué precio tiene?`;

/** "Memoria RAM · Corsair" (los celulares solo muestran la marca) */
export const etiquetaDe = (p: Producto) => [p.tienda === "cel" ? null : p.categoria ? nombreCat[p.categoria] : null, p.marca].filter(Boolean).join(" · ");
export const nombreItem = (p: Producto, nombreOpcion: string) => (nombreOpcion ? `${p.nombre} (${nombreOpcion})` : p.nombre);

const ilusCategoria = contenido.ilusCategoria;
export const ilustracionDe = (p: Producto) =>
  p.ilustracion || (p.tienda === "cel" ? "celular" : p.categoria ? ilusCategoria[p.categoria] : undefined) || "celular";

/** Texto normalizado de cada producto para el buscador (nombre, marca, tipo, sección, nota, características y versiones) */
export const TEXTO_BUSQUEDA: Record<string, string> = Object.fromEntries(
  PRODUCTOS.map(p => [
    p.id,
    norm([p.nombre, p.marca ?? "", p.categoria ? nombreCat[p.categoria] ?? "" : "", VISTAS[TIENDA_VISTA[p.tienda]] ?? "", p.nota ?? "", ...p.specs, ...p.opciones.map(o => o.nombre)].join(" "))
  ])
);

export const marcasDe = (ps: Producto[]) => [...new Set(ps.map(p => p.marca).filter((m): m is string => Boolean(m)))];
