/* 26/11/2026 (idea 6, como «Comparar» de Samsung y Best Buy): hasta 3 productos elegidos para comparar. Se guardan en
   este navegador mientras la persona sigue mirando la tienda; la bandeja de abajo y las tarjetas se enteran al cambiar. */
import { useEffect, useState } from "react";

export const TOPE_COMPARAR = 3;
const CLAVE = "rf-comparar";
const EVENTO = "rf:comparar";

function leer(): string[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(CLAVE) ?? "[]") as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, TOPE_COMPARAR) : [];
  } catch {
    return [];
  }
}
function guardar(ids: string[]) {
  try { sessionStorage.setItem(CLAVE, JSON.stringify(ids)); } catch { /* sin almacenamiento: dura mientras la página siga abierta */ }
  memoria = ids;
  window.dispatchEvent(new Event(EVENTO));
}
let memoria: string[] = typeof window === "undefined" ? [] : leer();

/** Quita o pone un producto. Devuelve false si ya había 3 y no cupo */
export function alternarComparar(id: string): boolean {
  if (memoria.includes(id)) { guardar(memoria.filter(x => x !== id)); return true; }
  if (memoria.length >= TOPE_COMPARAR) return false;
  guardar([...memoria, id]);
  return true;
}
export const limpiarComparar = () => guardar([]);

export function useComparar(): string[] {
  const [ids, setIds] = useState(memoria);
  useEffect(() => {
    const oir = () => setIds(memoria);
    window.addEventListener(EVENTO, oir);
    return () => window.removeEventListener(EVENTO, oir);
  }, []);
  return ids;
}
