/* Idea 38: compartir el carrito con un enlace (por ejemplo, para que otra persona lo pague o lo revise).
   El enlace lleva solo qué productos y cuántos: /RocketFix/?carrito=sa07~0~1,ab12~2~3 (producto~versión~cantidad).
   Al abrirlo, la tienda pregunta antes de agregarlos; nunca reemplaza lo que la persona ya tenía. */
import type { LineaCarrito } from "../types";

const MAX_LINEAS = 30;
const MAX_CANTIDAD = 20;

export function enlaceCarrito(lineas: Pick<LineaCarrito, "clave" | "cantidad">[], origen = location.origin, base = import.meta.env.BASE_URL) {
  const valor = lineas.map(l => `${l.clave}~${l.cantidad}`).join(",");
  return `${origen}${base}?carrito=${encodeURIComponent(valor)}`;
}

/** Lee ?carrito= de la dirección. Devuelve { "id~versión": cantidad } con solo lo que tiene buena forma (lo demás se ignora) */
export function leerCarritoCompartido(busqueda: string): Record<string, number> {
  const crudo = new URLSearchParams(busqueda).get("carrito");
  const out: Record<string, number> = {};
  if (!crudo) return out;
  for (const parte of crudo.split(",").slice(0, MAX_LINEAS)) {
    const m = /^([^~,]{1,60})~(\d{1,2})~(\d{1,3})$/.exec(parte.trim());
    if (!m) continue;
    const q = Math.min(MAX_CANTIDAD, Number(m[3]));
    if (q > 0) out[`${m[1]}~${Number(m[2])}`] = q;
  }
  return out;
}
