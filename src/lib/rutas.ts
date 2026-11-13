/* Direcciones de la tienda.
   Mejora 13 (12/11/2026): direcciones limpias, sin #: /RocketFix/celulares/, /RocketFix/p/sa07/, /RocketFix/buscar/iphone/,
   /RocketFix/marca/cooler-master/. Son las mismas que ya tenían las páginas para buscadores (scripts/paginas-estaticas.mjs),
   así que ahora lo que se comparte, lo que ve Google y lo que muestra la barra del navegador es una sola dirección.
   · Los enlaces viejos con # (#celulares, #p/sa07…) siguen funcionando: al abrirlos, la dirección pasa a la limpia.
   · Las secciones de la portada siguen con # (/RocketFix/#servicios): no son páginas aparte, solo bajan hasta ese punto.
   · Los enlaces de la tienda no recargan la página: cambian la dirección y la tienda dibuja la nueva página (navegar).
   · Una dirección que no tiene página propia en GitHub Pages (ej.: /RocketFix/buscar/…) abre 404.html, que es la misma
     tienda (lo genera scripts/paginas-estaticas.mjs). */
import { startTransition, useEffect, useState } from "react";
import { ARTICULOS, PRODUCTOS, VISTA_TIENDA } from "../data/catalogo";
import politicas from "../data/politicas.json";
import { slug } from "./formato";
import { suave } from "./animaciones";
import type { Ruta } from "../types";

/** Raíz de la tienda (ej.: /RocketFix/) */
export const BASE = import.meta.env.BASE_URL;

/** Páginas de políticas (garantia, cambios-y-devoluciones, datos-personales) */
const POLITICAS_IDS = politicas.paginas.map(p => p.id);
/** Páginas de ayuda (las mismas de data/ayuda.json; rutas.test.ts revisa que coincidan). Van aquí escritas para no cargar
    los textos de ayuda con la tienda: se bajan solo al abrir una de estas páginas */
export const INFO_IDS = ["busca-por-uso", "todas-las-marcas", "sigue-tu-pedido", "preguntas-frecuentes", "glosario", "guia-de-originales",
  "cuidado-de-tus-equipos", "antes-de-tu-reparacion", "diagnostico", "empresas"];

const decodificar = (s: string) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

/** Anclas de la portada que no son páginas aparte */
const ANCLAS_INICIO = ["servicios", "contacto", "orden", "categorias", "calificaciones", "como-comprar", "regalos", "ideas-regalo", "presupuesto", "marcas", "envios", "tu-celular", "recientes"];

/** Nombre de la marca a partir de su dirección (cooler-master → Cooler Master). Acepta también el nombre tal cual (enlaces viejos) */
let marcasPorSlug: Map<string, string> | null = null;
function marcaDe(texto: string) {
  marcasPorSlug ??= new Map(PRODUCTOS.flatMap(p => (p.marca ? [[slug(p.marca), p.marca] as const] : [])));
  return marcasPorSlug.get(texto) ?? marcasPorSlug.get(slug(texto)) ?? texto;
}

/** Lee una dirección: «#celulares» (vieja), «celulares», «/RocketFix/celulares/» o «/RocketFix/#servicios» */
export function leerRuta(direccion: string): Ruta {
  let h = direccion.startsWith(BASE) ? direccion.slice(BASE.length) : direccion;
  h = h.replace(/^#\/?/, "").replace(/^\//, "").replace(/\/?(index\.html)?$/, "");
  if (!h || h === "inicio") return { tipo: "inicio" };
  if (ANCLAS_INICIO.includes(h)) return { tipo: "inicio", ancla: h };
  if (h.startsWith("p/")) return { tipo: "producto", id: decodificar(h.slice(2)) };
  if (h.startsWith("buscar/") || h === "buscar") return { tipo: "buscar", q: decodificar(h.slice(7)) };
  if (h.startsWith("marca/")) return { tipo: "marca", marca: marcaDe(decodificar(h.slice(6))) };
  if (h === "blog") return { tipo: "blog" };
  if (h === "favoritos") return { tipo: "favoritos" };
  if (ARTICULOS.some(a => a.id === h)) return { tipo: "articulo", id: h };
  if (POLITICAS_IDS.includes(h)) return { tipo: "politica", id: h };
  if (INFO_IDS.includes(h)) return { tipo: "info", id: h };
  const tienda = VISTA_TIENDA[h];
  if (tienda) return { tipo: "tienda", vista: h, tienda };
  return { tipo: "no-encontrada", hash: h };
}

export const claveRuta = (r: Ruta) => {
  switch (r.tipo) {
    case "inicio": return "inicio";
    case "tienda": return r.vista;
    case "producto": return `p/${r.id}`;
    case "buscar": return `buscar/${r.q}`;
    case "marca": return `marca/${r.marca}`;
    case "blog": return "blog";
    case "favoritos": return "favoritos";
    case "articulo": return r.id;
    case "politica": return r.id;
    case "info": return r.id;
    case "no-encontrada": return r.hash;
  }
};

/** Dirección limpia de una página */
export function direccionDe(r: Ruta): string {
  switch (r.tipo) {
    case "inicio": return r.ancla ? `${BASE}#${r.ancla}` : BASE;
    case "tienda": return `${BASE}${r.vista}/`;
    case "producto": return `${BASE}p/${encodeURIComponent(r.id)}/`;
    case "buscar": return r.q ? `${BASE}buscar/${encodeURIComponent(r.q)}/` : `${BASE}buscar/`;
    case "marca": return `${BASE}marca/${slug(r.marca) || encodeURIComponent(r.marca)}/`;
    case "blog": return `${BASE}blog/`;
    case "favoritos": return `${BASE}favoritos/`;
    case "articulo": case "politica": case "info": return `${BASE}${r.id}/`;
    case "no-encontrada": return `${BASE}${r.hash}/`;
  }
}

/** Enlace a una página por su nombre corto: hrefDe("celulares") → /RocketFix/celulares/, hrefDe("servicios") → /RocketFix/#servicios */
export const hrefDe = (nombre: string) => direccionDe(leerRuta(nombre));
export const hrefProducto = (id: string) => direccionDe({ tipo: "producto", id });
export const hrefBusqueda = (q: string) => direccionDe({ tipo: "buscar", q: q.trim() });
/** Página con los productos de una marca (por la marca guardada en cada producto, no por texto: "Intel" no trae "inteligente") */
export const hrefMarca = (marca: string) => direccionDe({ tipo: "marca", marca });

/** Página que muestra ahora la barra de direcciones */
export function rutaActual(): Ruta {
  const camino = location.pathname.startsWith(BASE) ? location.pathname.slice(BASE.length).replace(/\/?(index\.html)?$/, "") : "";
  return camino ? leerRuta(camino) : leerRuta(location.hash);
}

/** Aviso interno de «cambió la página» (además de atrás/adelante del navegador y de los cambios de #) */
const EVENTO = "rf:navegar";

/** Abre una página de la tienda sin recargar */
export function navegar(href: string, { reemplazar = false } = {}) {
  const destino = new URL(href, location.href);
  const ahora = location.pathname + location.search + location.hash;
  const nueva = destino.pathname + destino.search + destino.hash;
  if (nueva !== ahora) history[reemplazar ? "replaceState" : "pushState"](null, "", nueva);
  window.dispatchEvent(new Event(EVENTO));
}

/** Llama a `f` cada vez que cambia la página (enlaces, atrás/adelante, #). Devuelve con qué dejar de escuchar */
export function alCambiarPagina(f: () => void) {
  window.addEventListener("popstate", f);
  window.addEventListener("hashchange", f);
  window.addEventListener(EVENTO, f);
  return () => {
    window.removeEventListener("popstate", f);
    window.removeEventListener("hashchange", f);
    window.removeEventListener(EVENTO, f);
  };
}

/** Los enlaces de la tienda (<a href="/RocketFix/…">) se abren sin recargar. Con Ctrl, Cmd, rueda del mouse o
    «abrir en otra pestaña», el navegador hace lo de siempre. Los enlaces viejos con # también se llevan a la dirección limpia */
export function interceptarEnlaces() {
  const alTocar = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    const crudo = a.getAttribute("href");
    if (!crudo) return;
    let destino: URL;
    if (crudo.startsWith("#")) {
      // #pagina, preguntas frecuentes…: anclas dentro de la misma página. Las páginas de la tienda (#celulares) sí se llevan
      const r = leerRuta(crudo);
      if (r.tipo === "no-encontrada" || (r.tipo === "inicio" && rutaActual().tipo === "inicio")) return;
      destino = new URL(direccionDe(r), location.href);
    } else {
      destino = new URL(a.href);
      if (destino.origin !== location.origin || !destino.pathname.startsWith(BASE)) return;
      // Archivos (fotos, PDF, sitemap…): el navegador los abre normal
      if (/\.[a-z0-9]{2,5}$/i.test(destino.pathname) && !destino.pathname.endsWith("index.html")) return;
    }
    if (destino.pathname === location.pathname && destino.search === location.search) {
      // Misma página: si es un #ancla, el navegador baja hasta ella (y avisa con hashchange); si no, solo se sube al inicio
      if (destino.hash) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: suave() });
      return;
    }
    e.preventDefault();
    navegar(destino.pathname + destino.search + destino.hash);
  };
  document.addEventListener("click", alTocar);
  return () => document.removeEventListener("click", alTocar);
}

/** Ruta actual. Al regresar a la página anterior (botón atrás o "Volver") se vuelve al mismo punto donde estaba la persona. */
export function useRuta(): Ruta {
  const [ruta, setRuta] = useState(rutaActual);
  useEffect(() => {
    // Pila de páginas visitadas con su posición; si la nueva es la penúltima, la persona está regresando
    const pila: { clave: string; y: number }[] = [{ clave: claveRuta(rutaActual()), y: 0 }];
    const alCambiar = () => {
      const nueva = rutaActual();
      const clave = claveRuta(nueva);
      const actual = pila[pila.length - 1];
      if (actual?.clave === clave) {
        // Misma página (ej.: otra sección de la portada): solo se actualiza el ancla
        setRuta(r => (r.tipo === nueva.tipo && JSON.stringify(r) === JSON.stringify(nueva) ? r : nueva));
        return;
      }
      if (actual) actual.y = window.scrollY;
      const previa = pila[pila.length - 2];
      if (previa && previa.clave === clave) {
        pila.pop();
        volverA = previa.y;
      } else {
        pila.push({ clave, y: 0 });
        if (pila.length > 50) pila.shift();
        volverA = null;
      }
      setRuta(nueva);
    };
    const dejar = alCambiarPagina(alCambiar);
    const dejarEnlaces = interceptarEnlaces();
    return () => { dejar(); dejarEnlaces(); };
  }, []);
  return ruta;
}

/** Posición a la que hay que volver después del próximo cambio de página (null: ir arriba) */
let volverA: number | null = null;
export const tomarPosicion = () => {
  const p = volverA;
  volverA = null;
  return p;
};
/** ¿La página que se va a dibujar es una a la que la persona regresa (y hay que volver a un punto más abajo)? */
export const vaARegresar = () => volverA !== null && volverA > 0;

/** Partes de abajo de una página (filas de productos): se dibujan justo después de pintar la parte de arriba, y en
    pedazos que no traban la página (startTransition). Así abrir un producto muestra de inmediato la foto, el precio y
    los botones (13/11/2026: antes todo se dibujaba de una vez, 55–85 ms de página trabada en un buen computador).
    Al regresar con «atrás» se dibuja todo de una vez, para poder volver al mismo punto de la página. */
export function useDespuesDePintar(): boolean {
  const [listo, setListo] = useState(vaARegresar);
  useEffect(() => {
    if (listo) return;
    let hecho = false;
    const ya = () => { if (!hecho) { hecho = true; startTransition(() => setListo(true)); } };
    const cuadro = requestAnimationFrame(() => window.setTimeout(ya, 0));
    // Por si el navegador no pinta (pestaña en segundo plano): igual se dibuja
    const respaldo = window.setTimeout(ya, 400);
    return () => { hecho = true; cancelAnimationFrame(cuadro); window.clearTimeout(respaldo); };
  }, [listo]);
  return listo;
}
