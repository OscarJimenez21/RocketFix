/* Mejora de rendimiento 2 (12/11/2026): las fotos extra de cada producto (datos/galerias.json, unos 70 KB) ya no van en el
   programa que baja todo el que entra a la tienda. Se piden una sola vez, cuando hacen falta: al abrir un producto, al
   pasar el mouse por una tarjeta (para la segunda foto) o en los ratos libres después de abrir la tienda.
   Mientras llegan, cada producto muestra su foto principal, que es la de siempre. */
import { useEffect, useState } from "react";
import { recurso } from "./formato";
import type { Producto } from "../types";

let galerias: Record<string, string[]> | null = null;
let pedido: Promise<Record<string, string[]>> | null = null;
const avisar = new Set<() => void>();

/** Pide el archivo de galerías (una sola vez; si falla, se puede volver a intentar más tarde) */
export function cargarGalerias(): Promise<Record<string, string[]>> {
  if (galerias) return Promise.resolve(galerias);
  pedido ??= fetch(recurso("datos/galerias.json"))
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((g: Record<string, string[]>) => { galerias = g; avisar.forEach(f => f()); return g; })
    .catch(() => { pedido = null; return {}; });
  return pedido;
}

/** Fotos de un producto: la principal y, si ya llegaron, las de su galería */
export const galeriaDe = (p: Producto): string[] => (p.imagen ? [p.imagen, ...(galerias?.[p.id] ?? [])] : []);

/** Igual que galeriaDe, pero vuelve a dibujar el componente cuando llegan las galerías */
export function useGaleria(p: Producto, pedir = true): string[] {
  const [, setVuelta] = useState(0);
  useEffect(() => {
    if (galerias || !pedir) return;
    const f = () => setVuelta(n => n + 1);
    avisar.add(f);
    void cargarGalerias();
    return () => { avisar.delete(f); };
  }, [pedir]);
  return galeriaDe(p);
}
