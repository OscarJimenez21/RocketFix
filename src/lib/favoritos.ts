/* Mejora 8 (12/11/2026): favoritos. La persona toca el corazón de un producto y queda guardado solo en este navegador
   (no se envía a ninguna parte ni se necesita cuenta). En /favoritos/ ve su lista y la puede enviar por WhatsApp para
   pedir una cotización. Si abre la tienda en otra pestaña, la lista se actualiza sola. */
import { useSyncExternalStore } from "react";

const CLAVE = "rf-favoritos";
/** Tope para que la lista (y el mensaje de WhatsApp) no crezca sin fin */
export const TOPE_FAVORITOS = 60;

function leer(): string[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(CLAVE) || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, TOPE_FAVORITOS) : [];
  } catch { return []; }
}

let lista: string[] = typeof window === "undefined" ? [] : leer();
const avisar = new Set<() => void>();

function guardar(nueva: string[]) {
  lista = nueva;
  try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch { /* sin almacenamiento: dura mientras esté abierta */ }
  avisar.forEach(f => f());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", e => {
    if (e.key !== CLAVE) return;
    lista = leer();
    avisar.forEach(f => f());
  });
}

const suscribir = (f: () => void) => { avisar.add(f); return () => { avisar.delete(f); }; };

/** Lista de favoritos (lo último guardado primero) */
export const useFavoritos = () => useSyncExternalStore(suscribir, () => lista, () => lista);

/** Guarda o quita un producto. Devuelve true si quedó guardado */
export function alternarFavorito(id: string): boolean {
  if (lista.includes(id)) { guardar(lista.filter(x => x !== id)); return false; }
  guardar([id, ...lista].slice(0, TOPE_FAVORITOS));
  return true;
}

export const vaciarFavoritos = () => guardar([]);

/** Idea 99: suma una lista compartida a los favoritos (sin repetir, los nuevos primero). Devuelve cuántos se agregaron */
export function sumarFavoritos(ids: string[]): number {
  const nuevos = ids.filter(id => !lista.includes(id));
  if (nuevos.length) guardar([...nuevos, ...lista].slice(0, TOPE_FAVORITOS));
  return nuevos.length;
}

/** Idea 99: ?lista=a,b,c de la dirección (solo ids con buena forma; el que no exista en la tienda se descarta al mostrar) */
export function leerListaCompartida(busqueda: string): string[] {
  const crudo = new URLSearchParams(busqueda).get("lista");
  if (!crudo) return [];
  return [...new Set(crudo.split(",").map(s => s.trim()).filter(s => /^[^~,\s]{1,60}$/.test(s)))].slice(0, TOPE_FAVORITOS);
}
