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
  /** Idea 34: franja de entrega preferida (Mañana, Tarde o vacío = sin preferencia) */
  franja?: string;
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
    return { nombre: texto(x.nombre, 120), entrega: x.entrega === "nacional" ? "nacional" : "bogota", dir: texto(x.dir, 240), pago: texto(x.pago, 120) || vacio.pago, nota: texto(x.nota, 500), ...(FRANJAS.includes(texto(x.franja, 40)) ? { franja: texto(x.franja, 40) } : {}) };
  } catch {
    return vacio;
  }
}

/** Idea 34: franjas de entrega que puede pedir el cliente (la tienda las confirma por WhatsApp) */
export const FRANJAS = ["Mañana", "Tarde"];

/** Idea 35: número corto de pedido (RF- y 5 letras o números sin confusiones: sin 0/O ni 1/I) para buscarlo en WhatsApp */
export function nuevoNumeroPedido(azar: () => number = Math.random) {
  const letras = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let n = "RF-";
  for (let k = 0; k < 5; k++) n += letras[Math.floor(azar() * letras.length)] ?? "X";
  return n;
}

export const subtotalDe = (lineas: LineaCarrito[]) => lineas.reduce((s, l) => s + l.opcion.precio * l.cantidad, 0);

/** numero: el de idea 35 (va en el saludo). pagoEnLinea reemplaza el medio de pago cuando el cliente paga con Bold (incluye la referencia) */
export function mensajePedido(lineas: LineaCarrito[], d: DatosPedido, pagoEnLinea?: string, numero?: string) {
  const l = [`Hola ${CONFIG.nombre}, quiero hacer este pedido${numero ? ` (n.º ${numero})` : ""}:`, ""];
  for (const { producto, opcion, cantidad } of lineas) l.push(`• ${cantidad} × ${nombreItem(producto, opcion.nombre)}: ${dinero(opcion.precio * cantidad)}`);
  const s = subtotalDe(lineas);
  const envio = envioDe(d.entrega, s);
  l.push("", `Productos: ${dinero(s)}`, `Envío: ${envio ? dinero(envio) : "gratis"}`, `Total: ${dinero(s + envio)}`, "", `Nombre: ${d.nombre || "(sin escribir)"}`);
  l.push(`Entrega: ${d.entrega === "bogota" ? "Domicilio en Bogotá y alrededores" : "Envío a otra ciudad"}`);
  l.push(`Dirección: ${d.dir || "(sin escribir)"}`);
  if (d.franja) l.push(`Prefiere recibirlo: en la ${d.franja.toLowerCase()}`);
  l.push(`Pago: ${pagoEnLinea || d.pago}`);
  if (d.nota) l.push(`Nota: ${d.nota}`);
  return l.join("\n");
}
