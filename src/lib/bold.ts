/* Pago en línea con Bold (botón de pago de checkout.bold.co). Igual que la tienda original:
   - Solo se activa si CONFIG.bold.llave tiene la llave de identidad (es pública, no es la llave secreta).
   - Con CONFIG.bold.firmaUrl el total llega firmado; sin ella, el cliente escribe el total en Bold (se le copia).
   - La llave secreta de Bold NUNCA va en este código. */
import { CONFIG } from "../data/catalogo";
import type { ZonaEntrega } from "../types";
import { dinero } from "./formato";

const BOLD_JS = "https://checkout.bold.co/library/boldPaymentButton.js";

interface VentaBold {
  currency: string;
  apiKey: string;
  description: string;
  redirectionUrl?: string;
  orderId?: string;
  amount?: string;
  integritySignature?: string;
}
declare global {
  interface Window { BoldCheckout?: new (venta: VentaBold) => { open: () => void } }
}

export const boldActivo = () => Boolean(CONFIG.bold.llave);

function cargarBold(): Promise<void> {
  if (window.BoldCheckout) return Promise.resolve();
  return new Promise((listo, fallo) => {
    const s = document.createElement("script");
    s.src = BOLD_JS;
    s.onload = () => listo();
    s.onerror = () => fallo(new Error("No cargó Bold"));
    document.head.appendChild(s);
  });
}

export const nuevaReferencia = () => "RF" + Date.now().toString(36).toUpperCase();
/** Forma de las referencias que crea nuevaReferencia (RF + la hora en base 36) */
const REFERENCIA = /^RF[0-9A-Z]{6,12}$/;
/** Dónde se guarda el pedido mientras el cliente paga en Bold, para enviarlo por WhatsApp al volver */
export const clavePago = (ref: string) => "rf-pago-" + ref;

/** Estado con el que Bold devuelve al cliente (bold-tx-status): "approved", "pending" u otro, que se trata como no completado */
const ESTADO = /^[a-z][a-z_-]{1,24}$/;
/** boldId: el «bold-order-id» con que Bold devuelve al cliente (con el total firmado es la misma referencia) */
export interface RegresoBold { ref: string; estado: string; boldId?: string }
const ID_BOLD = /^[A-Za-z0-9_-]{1,60}$/;

/** Comprobante del pago según Bold (consulta por referencia, ver consultarPagoBold) */
export interface ComprobanteBold { transaccion: string; estado: string; total?: number; metodo?: string; fecha?: string }

const ESTADOS_BOLD: Record<string, string> = {
  APPROVED: "Aprobado", REJECTED: "Rechazado", FAILED: "Fallido", VOIDED: "Anulado", PROCESSING: "En proceso", PENDING: "Pendiente"
};
const METODOS_BOLD: Record<string, string> = { CREDIT_CARD: "Tarjeta", PSE: "PSE", NEQUI: "Nequi", BOTON_BANCOLOMBIA: "Botón Bancolombia" };

/** Lee la respuesta de Bold campo por campo: solo se usa lo que tiene la forma esperada */
export function leerComprobante(d: unknown): ComprobanteBold | null {
  if (!d || typeof d !== "object") return null;
  const x = d as Record<string, unknown>;
  const transaccion = typeof x.transaction_id === "string" && ID_BOLD.test(x.transaction_id) ? x.transaction_id : "";
  const estado = typeof x.payment_status === "string" ? ESTADOS_BOLD[x.payment_status] : undefined;
  if (!transaccion || !estado) return null;
  const c: ComprobanteBold = { transaccion, estado };
  if (typeof x.total === "number" && Number.isFinite(x.total) && x.total >= 0) c.total = Math.round(x.total);
  if (typeof x.payment_method === "string") c.metodo = METODOS_BOLD[x.payment_method] ?? x.payment_method.slice(0, 30).replace(/[^\w ]/g, "");
  if (typeof x.transaction_date === "string") {
    const f = new Date(x.transaction_date.replace(" ", "T"));
    if (!Number.isNaN(f.getTime())) c.fecha = f.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bogota" });
  }
  return c;
}

/** Línea para el mensaje de WhatsApp: «Comprobante Bold: CNPVI70CQC0EY · Aprobado · $ 2.900.000 · Tarjeta · 14/11/26, 4:32 p. m.» */
export const lineaComprobante = (c: ComprobanteBold) =>
  `Comprobante Bold: ${[c.transaccion, c.estado, c.total !== undefined ? dinero(c.total) : "", c.metodo ?? "", c.fecha ?? ""].filter(Boolean).join(" · ")}`;

/** Consulta un pago en Bold por su referencia (API de consulta del botón de pagos, con la llave de identidad, que es
    pública). Bold avisa que un pago puede tardar en aparecer: se reintenta unas veces y, si no aparece, devuelve null.
    El estado que da puede no ser el final (PSE): antes de despachar se confirma en el panel de Bold. */
export async function consultarPagoBold(id: string, intentos = 4, espera = 3000): Promise<ComprobanteBold | null> {
  if (!CONFIG.bold.llave || !ID_BOLD.test(id)) return null;
  for (let k = 0; k < intentos; k++) {
    if (k) await new Promise(r => setTimeout(r, espera));
    try {
      const r = await fetch(`https://payments.api.bold.co/v2/payment-voucher/${encodeURIComponent(id)}`, { headers: { Authorization: `x-api-key ${CONFIG.bold.llave}` } });
      if (r.ok) { const c = leerComprobante(await r.json()); if (c) return c; }
    } catch { /* sin conexión: se reintenta */ }
  }
  return null;
}

/** Lo que el servicio de firma necesita para recalcular el total con los precios publicados (no confía en el total) */
export interface DetalleBold {
  items: { id: string; opcion: number; cantidad: number }[];
  zona: ZonaEntrega;
}

/** El servicio de firma respondió 409: el total no da con los precios publicados (cambiaron desde que se abrió la página) */
export class PreciosCambiaron extends Error {}

/** Abre el pago. Devuelve "copiado" si el cliente debe pegar el total en Bold. */
export async function abrirBold(ref: string, total: number, descripcion: string, detalle: DetalleBold): Promise<"firmado" | "copiado"> {
  const venta: VentaBold = { currency: "COP", apiKey: CONFIG.bold.llave, description: descripcion };
  // Bold solo acepta direcciones de regreso con https (la página publicada); en pruebas locales se omite
  if (location.protocol === "https:") venta.redirectionUrl = location.origin + location.pathname + "?pedido=" + ref;
  await cargarBold();
  let modo: "firmado" | "copiado" = "copiado";
  if (CONFIG.bold.firmaUrl) {
    const r = await fetch(CONFIG.bold.firmaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: ref, amount: String(total), currency: "COP", ...detalle })
    });
    if (r.status === 409) throw new PreciosCambiaron();
    // Sin una firma válida no se abre el pago: Bold lo rechazaría o cobraría sin el total amarrado
    const respuesta: unknown = r.ok ? await r.json() : null;
    const hash = respuesta && typeof respuesta === "object" && "hash" in respuesta ? respuesta.hash : null;
    if (typeof hash !== "string" || !hash) throw new Error("El servicio de firma no respondió");
    Object.assign(venta, { orderId: ref, amount: String(total), integritySignature: hash });
    modo = "firmado";
  } else {
    try { await navigator.clipboard.writeText(String(total)); } catch { /* sin permiso para copiar: se muestra el total */ }
  }
  if (!window.BoldCheckout) throw new Error("Bold no está disponible");
  new window.BoldCheckout(venta).open();
  return modo;
}

/** Cuando Bold devuelve al cliente (?pedido=…&bold-tx-status=…). Se lee una sola vez: después se limpian los datos
    de la dirección, así que una segunda lectura (React la repite en modo de desarrollo) devuelve el mismo resultado.
    Solo cuenta si la referencia tiene la forma de las nuestras, el estado tiene forma de estado y este navegador fue el que
    inició ese pago (dejó guardado su pedido). Antes bastaba con abrir un enlace con ?pedido=…&bold-tx-status=approved para
    que la página dijera «pago aprobado» con cualquier texto como referencia y le vaciara el carrito a quien lo abriera. */
let regreso: RegresoBold | null | undefined;
export function leerRegresoBold(): RegresoBold | null {
  if (regreso !== undefined) return regreso;
  const q = new URLSearchParams(location.search);
  const ref = q.get("pedido") ?? "", estado = q.get("bold-tx-status") ?? "";
  let propio = false;
  try { propio = REFERENCIA.test(ref) && localStorage.getItem(clavePago(ref)) !== null; } catch { /* sin almacenamiento */ }
  const boldId = q.get("bold-order-id") ?? "";
  regreso = propio && ESTADO.test(estado) ? { ref, estado, ...(ID_BOLD.test(boldId) ? { boldId } : {}) } : null;
  // La dirección queda limpia aunque los datos no sirvan
  if (q.has("pedido") || q.has("bold-tx-status") || q.has("bold-order-id")) history.replaceState(null, "", location.pathname + location.hash);
  return regreso;
}
