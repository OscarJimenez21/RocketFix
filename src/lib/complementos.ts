/* Idea 14: «Completa tu compra». Para cada tipo de producto, las categorías de la tienda que suelen ir con él (cargador y
   audífonos con un celular; mouse y diadema con un portátil…). Primero los de la misma marca y, dentro de cada categoría,
   los más económicos; se van alternando las categorías para que la fila no sea de una sola cosa. Solo productos con precio
   y más baratos que el producto que se está viendo */
import { PRODUCTOS } from "../data/catalogo";
import type { Producto } from "../types";

const POR_CATEGORIA: Record<string, string[]> = {
  portatiles: ["mouse", "diademas", "portatil-acc", "memorias", "pads"],
  "portatiles-gamer": ["mouse", "diademas", "pads", "portatil-acc", "memorias"],
  escritorio: ["monitores", "combos", "teclados", "mouse", "diademas"],
  "escritorio-gamer": ["monitores", "teclados", "mouse", "diademas", "pads"],
  procesadores: ["refrigeracion", "madre", "ram"],
  madre: ["ram", "almacenamiento", "procesadores"],
  ram: ["almacenamiento", "refrigeracion"],
  video: ["fuentes", "cajas", "monitores"],
  almacenamiento: ["ram", "memorias"],
  fuentes: ["cajas", "refrigeracion"],
  cajas: ["refrigeracion", "fuentes"],
  refrigeracion: ["cajas", "ram"],
  monitores: ["soportes", "cables", "teclados", "mouse"],
  teclados: ["mouse", "pads", "diademas"],
  mouse: ["pads", "teclados", "diademas"],
  combos: ["pads", "diademas"],
  diademas: ["mouse", "teclados", "streaming"],
  sillas: ["pads", "diademas"],
  consolas: ["controles", "diademas"],
  controles: ["cargadores", "diademas"],
  simuladores: ["controles"],
  vr: ["controles", "powerbank"],
  ipad: ["lapices", "cargadores"],
  tablets: ["cargadores", "audio", "lapices"],
  relojes: ["cargadores", "audio"],
  manillas: ["cargadores", "audio"],
  audio: ["cargadores", "cables-carga", "powerbank"],
  "audio-diadema": ["cables-carga", "cargadores"],
  parlantes: ["powerbank", "cargadores"],
  "parlantes-pc": ["teclados", "mouse"],
  televisores: ["parlantes", "cables"]
};
/** Celulares (no tienen categoría) */
const CELULAR = ["cargadores", "audio", "powerbank", "cables-carga", "relojes"];

export function complementosDe(p: Producto, cuantos = 8): Producto[] {
  const cats = p.tienda === "cel" ? CELULAR : POR_CATEGORIA[p.categoria ?? ""];
  if (!cats?.length) return [];
  const precio = Math.min(...p.opciones.map(o => o.precio));
  const grupos = cats.map(c =>
    PRODUCTOS.filter(r => r.categoria === c && r.id !== p.id && !r.consultar && Math.min(...r.opciones.map(o => o.precio)) < precio)
      .sort((a, b) => Number(b.marca === p.marca) - Number(a.marca === p.marca) || a.opciones[0].precio - b.opciones[0].precio)
  );
  // Uno de cada categoría por vuelta, hasta llenar la fila
  const lista: Producto[] = [];
  for (let vuelta = 0; lista.length < cuantos && grupos.some(g => g.length > vuelta); vuelta++) {
    for (const g of grupos) {
      const r = g[vuelta];
      if (r && lista.length < cuantos) lista.push(r);
    }
  }
  return lista;
}
