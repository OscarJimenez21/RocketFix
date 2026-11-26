/* 26/11/2026 (usuario): descuentos del carrito.
   · 5 % pagando en efectivo o transferencia (Bre-B, Daviplata o transferencia bancaria). Con tarjeta (contra entrega o en
     línea con Bold) no hay descuento: por eso el pago con Bold siempre cobra el precio completo, el mismo que firma el
     Worker de Bold (no hay que cambiarlo).
   · Códigos de descuento (data/codigos.json), con la misma regla: solo sin tarjeta.
   El código se descuenta de los productos y el 5 % se calcula sobre lo que queda. El envío no tiene descuento. */
import datos from "../data/codigos.json";

export const DESCUENTO_PAGO = 0.05;
/** Opción de pago que el carrito agrega cuando Bold está activo */
export const PAGO_BOLD = "Tarjeta en línea con Bold (crédito a cuotas, débito o PSE)";
/** Los medios con tarjeta (o Bold) no llevan descuento */
export const pagoConDescuento = (pago: string) => Boolean(pago) && !/tarjeta|bold/i.test(pago);

export interface Codigo { codigo: string; porcentaje?: number; valor?: number; minimo?: number; desde?: string; hasta?: string }
export const CODIGOS: Codigo[] = (datos.codigos as unknown[]).filter((c): c is Codigo =>
  !!c && typeof c === "object" && typeof (c as Codigo).codigo === "string" && (typeof (c as Codigo).porcentaje === "number" || typeof (c as Codigo).valor === "number"));

const limpiar = (t: string) => t.trim().toUpperCase().replace(/\s+/g, "");
const redondear = (n: number) => Math.round(n / 100) * 100;
const fechaHoy = (hoy: Date) => `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

export type Revision = { ok: true; codigo: Codigo; monto: number } | { ok: false; motivo: string };

/** Revisa un código contra los productos del pedido (subtotal sin envío) */
export function revisarCodigo(texto: string, subtotal: number, hoy = new Date(), lista: Codigo[] = CODIGOS): Revision {
  const t = limpiar(texto);
  if (!t) return { ok: false, motivo: "Escribe el código." };
  const c = lista.find(x => limpiar(x.codigo) === t);
  if (!c) return { ok: false, motivo: "Ese código no existe o ya no está vigente." };
  const dia = fechaHoy(hoy);
  if ((c.desde && dia < c.desde) || (c.hasta && dia > c.hasta)) return { ok: false, motivo: "Ese código no está vigente hoy." };
  if (c.minimo && subtotal < c.minimo) return { ok: false, motivo: `Ese código es para compras desde $${c.minimo.toLocaleString("es-CO")} en productos.` };
  const monto = Math.min(subtotal, c.porcentaje ? redondear(subtotal * c.porcentaje / 100) : c.valor ?? 0);
  return { ok: true, codigo: c, monto };
}

export interface Totales { descuentoCodigo: number; codigo?: string; descuentoPago: number; total: number }

/** Totales del pedido con los descuentos que apliquen al medio de pago elegido */
export function calcularTotales(subtotal: number, envio: number, pago: string, codigo?: string, hoy = new Date()): Totales {
  if (!pagoConDescuento(pago)) return { descuentoCodigo: 0, descuentoPago: 0, total: subtotal + envio };
  const r = codigo ? revisarCodigo(codigo, subtotal, hoy) : null;
  const descuentoCodigo = r?.ok ? r.monto : 0;
  const descuentoPago = redondear((subtotal - descuentoCodigo) * DESCUENTO_PAGO);
  return { descuentoCodigo, ...(r?.ok ? { codigo: limpiar(r.codigo.codigo) } : {}), descuentoPago, total: subtotal - descuentoCodigo - descuentoPago + envio };
}

/** Precio con el 5 % de pago en efectivo o transferencia (para mostrarlo junto al precio normal) */
export const precioConDescuento = (precio: number) => precio - redondear(precio * DESCUENTO_PAGO);
