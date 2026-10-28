/* Rutas con # (las mismas de la tienda original: #celulares, #p/sa07, #buscar/iphone, #blog-camaras…).
   Así los enlaces que ya se compartieron siguen funcionando y GitHub Pages no da 404 al recargar. */
import { useEffect, useState } from "react";
import { ARTICULOS, VISTA_TIENDA } from "../data/catalogo";
import type { Ruta } from "../types";

const decodificar = (s: string) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

/** Anclas de la portada que no son páginas aparte */
const ANCLAS_INICIO = ["servicios", "contacto", "orden", "categorias", "calificaciones"];

export function leerRuta(hash: string): Ruta {
  const h = hash.replace(/^#\/?/, "");
  if (!h || h === "inicio") return { tipo: "inicio" };
  if (ANCLAS_INICIO.includes(h)) return { tipo: "inicio", ancla: h };
  if (h.startsWith("p/")) return { tipo: "producto", id: decodificar(h.slice(2)) };
  if (h.startsWith("buscar/") || h === "buscar") return { tipo: "buscar", q: decodificar(h.slice(7)) };
  if (h.startsWith("marca/")) return { tipo: "marca", marca: decodificar(h.slice(6)) };
  if (h === "blog") return { tipo: "blog" };
  if (ARTICULOS.some(a => a.id === h)) return { tipo: "articulo", id: h };
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
    case "articulo": return r.id;
    case "no-encontrada": return r.hash;
  }
};

export const hrefProducto = (id: string) => `#p/${encodeURIComponent(id)}`;
export const hrefBusqueda = (q: string) => `#buscar/${encodeURIComponent(q.trim())}`;
/** Página con los productos de una marca (por la marca guardada en cada producto, no por texto: "Intel" no trae "inteligente") */
export const hrefMarca = (marca: string) => `#marca/${encodeURIComponent(marca)}`;

/** Ruta actual. Al regresar a la página anterior (botón atrás o "Volver") se vuelve al mismo punto donde estaba la persona. */
export function useRuta(): Ruta {
  const [ruta, setRuta] = useState(() => leerRuta(location.hash));
  useEffect(() => {
    // Pila de páginas visitadas con su posición; si la nueva es la penúltima, la persona está regresando
    const pila: { clave: string; y: number }[] = [{ clave: claveRuta(leerRuta(location.hash)), y: 0 }];
    const alCambiar = () => {
      const actual = pila[pila.length - 1];
      if (actual) actual.y = window.scrollY;
      const nueva = leerRuta(location.hash);
      const clave = claveRuta(nueva);
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
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
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
