/* Envío y mensaje del pedido: mismas reglas y mismo texto que la tienda original */
import { CONFIG, nombreItem } from "../data/catalogo";
import type { LineaCarrito, ZonaEntrega } from "../types";
import { dinero } from "./formato";

export const envioDe = (zona: ZonaEntrega, subtotal: number) => {
  const e = CONFIG.envios[zona];
  return subtotal >= e.gratisDesde ? 0 : e.costo;
};

export const reglaEnvio = (zona: ZonaEntrega) => {
  const e = CONFIG.envios[zona];
  return `Envío de ${dinero(e.costo)}, gratis en compras desde ${dinero(e.gratisDesde)}.`;
};

export interface DatosPedido {
  nombre: string;
  entrega: ZonaEntrega;
  dir: string;
  pago: string;
  nota: string;
}

/** Datos del pedido guardados en el navegador (para no volver a escribirlos al reabrir el carrito). Se leen campo por
    campo. Antes se usaban tal cual: si venían dañados o con otra forma (por ejemplo, de una versión anterior de la tienda),
    el carrito fallaba al dibujarse y la página quedaba en blanco */
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
export function leerDatosPedido(guardado: string | null): DatosPedido {
  const vacio: DatosPedido = { nombre: "", entrega: "bogota", dir: "", pago: CONFIG.pagos.bogota[0] ?? "", nota: "" };
  try {
    const d: unknown = JSON.parse(guardado || "null");
    if (!d || typeof d !== "object") return vacio;
    const x = d as Record<string, unknown>;
    return { nombre: texto(x.nombre, 120), entrega: x.entrega === "nacional" ? "nacional" : "bogota", dir: texto(x.dir, 240), pago: texto(x.pago, 120) || vacio.pago, nota: texto(x.nota, 500) };
  } catch {
    return vacio;
  }
}

export const subtotalDe = (lineas: LineaCarrito[]) => lineas.reduce((s, l) => s + l.opcion.precio * l.cantidad, 0);

/** pagoEnLinea reemplaza el medio de pago cuando el cliente paga con Bold (incluye la referencia) */
export function mensajePedido(lineas: LineaCarrito[], d: DatosPedido, pagoEnLinea?: string) {
  const l = [`Hola ${CONFIG.nombre}, quiero hacer este pedido:`, ""];
  for (const { producto, opcion, cantidad } of lineas) l.push(`• ${cantidad} × ${nombreItem(producto, opcion.nombre)}: ${dinero(opcion.precio * cantidad)}`);
  const s = subtotalDe(lineas);
  const envio = envioDe(d.entrega, s);
  l.push("", `Productos: ${dinero(s)}`, `Envío: ${envio ? dinero(envio) : "gratis"}`, `Total: ${dinero(s + envio)}`, "", `Nombre: ${d.nombre || "(sin escribir)"}`);
  l.push(`Entrega: ${d.entrega === "bogota" ? "Domicilio en Bogotá y alrededores" : "Envío a otra ciudad"}`);
  l.push(`Dirección: ${d.dir || "(sin escribir)"}`);
  l.push(`Pago: ${pagoEnLinea || d.pago}`);
  if (d.nota) l.push(`Nota: ${d.nota}`);
  return l.join("\n");
}
