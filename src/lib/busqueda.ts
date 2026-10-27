/* Buscador general: misma lógica que la tienda original. Todas las palabras deben aparecer (con sinónimos);
   suben los productos cuyo nombre empieza con lo buscado, los de la marca buscada y los más vendidos. */
import { MAS_VENDIDOS, PRODUCTOS, SINONIMOS, TEXTO_BUSQUEDA, desde } from "../data/catalogo";
import type { Producto } from "../types";
import { norm } from "./formato";

export const palabrasDe = (q: string) => norm(q).split(/\s+/).filter(Boolean);
const variantes = (w: string) => SINONIMOS[w] ?? [w];
const escRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buscarProductos(q: string): Producto[] {
  const palabras = palabrasDe(q);
  if (!palabras.length) return [];
  const resultados: { p: Producto; puntos: number }[] = [];
  for (const p of PRODUCTOS) {
    const texto = TEXTO_BUSQUEDA[p.id] ?? "";
    if (!palabras.every(w => variantes(w).some(v => texto.includes(v)))) continue;
    const n = norm(p.nombre);
    let puntos = MAS_VENDIDOS.includes(p.id) ? 2 : 0;
    for (const w of palabras) {
      const vs = variantes(w);
      if (vs.some(v => n.startsWith(v))) puntos += 6;
      else if (vs.some(v => new RegExp(`\\b${escRegex(v)}`).test(n))) puntos += 4;
      else if (vs.some(v => n.includes(v))) puntos += 2;
      if (p.marca && vs.includes(norm(p.marca))) puntos += 3;
    }
    resultados.push({ p, puntos });
  }
  return resultados.sort((a, b) => b.puntos - a.puntos || desde(a.p) - desde(b.p)).map(r => r.p);
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
