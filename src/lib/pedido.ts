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
