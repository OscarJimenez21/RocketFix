/* Idea 15: productos vistos hace poco. Se guardan solo en este navegador (los últimos 12, el más reciente primero) para
   mostrarlos al final de la página de producto y en la portada. No salen de aquí ni se envían a ningún lado */
import { useEffect, useState } from "react";
import { porId } from "../data/catalogo";
import type { Producto } from "../types";

const CLAVE = "rf-vistos";
const MAXIMO = 12;
const EVENTO = "rf-vistos";

function leer(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Anota que se abrió este producto */
export function anotarVisto(id: string) {
  const lista = [id, ...leer().filter(x => x !== id)].slice(0, MAXIMO);
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
}

/** Mejora: «Borrar la lista» en «Vistos recientemente» (la lista es solo de este navegador) */
export function borrarVistos() {
  try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new Event(EVENTO));
}

/** Productos vistos (que sigan en la tienda), sin el que se indique */
export function useVistos(sin?: string): Producto[] {
  const [ids, setIds] = useState<string[]>(leer);
  useEffect(() => { setIds(leer()); }, [sin]);
  useEffect(() => {
    const alBorrar = () => setIds(leer());
    window.addEventListener(EVENTO, alBorrar);
    return () => window.removeEventListener(EVENTO, alBorrar);
  }, []);
  return ids.filter(id => id !== sin).map(id => porId[id]).filter((p): p is Producto => Boolean(p));
}
