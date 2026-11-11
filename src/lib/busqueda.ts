/* Buscador general: misma lógica que la tienda original. Todas las palabras deben aparecer (con sinónimos);
   suben los productos cuyo nombre empieza con lo buscado, los de la marca buscada y los más vendidos. */
import { MAS_VENDIDOS, PRODUCTOS, SINONIMOS, TEXTO_BUSQUEDA, conPrecioPrimero, desde } from "../data/catalogo";
import type { Producto } from "../types";
import { norm } from "./formato";

export const palabrasDe = (q: string) => norm(q).split(/\s+/).filter(Boolean);
const variantes = (w: string) => SINONIMOS[w] ?? [w];
const escRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Se preparan una sola vez (antes se recalculaban por cada producto en cada letra que se escribía)
const VENDIDOS = new Set(MAS_VENDIDOS);
const NOMBRE = new Map(PRODUCTOS.map(p => [p.id, norm(p.nombre)]));
const MARCA = new Map(PRODUCTOS.map(p => [p.id, p.marca ? norm(p.marca) : ""]));

export function buscarProductos(q: string): Producto[] {
  const palabras = palabrasDe(q);
  if (!palabras.length) return [];
  // Las variantes y sus expresiones se arman una vez por búsqueda, no una vez por cada uno de los productos
  const grupos = palabras.map(w => {
    const vs = variantes(w);
    return { vs, inicioDePalabra: vs.map(v => new RegExp(`\\b${escRegex(v)}`)) };
  });
  const resultados: { p: Producto; puntos: number }[] = [];
  for (const p of PRODUCTOS) {
    const texto = TEXTO_BUSQUEDA[p.id] ?? "";
    if (!grupos.every(g => g.vs.some(v => texto.includes(v)))) continue;
    const n = NOMBRE.get(p.id) ?? "";
    const marca = MARCA.get(p.id) ?? "";
    let puntos = VENDIDOS.has(p.id) ? 2 : 0;
    for (const g of grupos) {
      if (g.vs.some(v => n.startsWith(v))) puntos += 6;
      else if (g.inicioDePalabra.some(r => r.test(n))) puntos += 4;
      else if (g.vs.some(v => n.includes(v))) puntos += 2;
      if (marca && g.vs.includes(marca)) puntos += 3;
    }
    resultados.push({ p, puntos });
  }
  // Con los mismos puntos, primero los que tienen precio y luego el más barato
  return resultados.sort((a, b) => b.puntos - a.puntos || conPrecioPrimero(a.p, b.p) || desde(a.p) - desde(b.p)).map(r => r.p);
}

/** Parte un texto en trozos marcando las letras que coinciden con lo escrito (sin importar tildes) */
export function resaltar(texto: string, palabras: string[]): { t: string; marcado: boolean }[] {
  const n = norm(texto);
  if (n.length !== texto.length) return [{ t: texto, marcado: false }];
  const marca = new Array<boolean>(texto.length).fill(false);
  for (const w of palabras) {
    let i = n.indexOf(w);
    while (i >= 0) {
      for (let j = i; j < i + w.length; j++) marca[j] = true;
      i = n.indexOf(w, i + w.length);
    }
  }
  const trozos: { t: string; marcado: boolean }[] = [];
  [...texto].forEach((c, i) => {
    const m = marca[i] ?? false;
    const ultimo = trozos[trozos.length - 1];
    if (ultimo && ultimo.marcado === m) ultimo.t += c;
    else trozos.push({ t: c, marcado: m });
  });
  return trozos;
}
