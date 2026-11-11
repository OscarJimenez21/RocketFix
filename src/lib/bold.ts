/* Pago en línea con Bold (botón de pago de checkout.bold.co). Igual que la tienda original:
   - Solo se activa si CONFIG.bold.llave tiene la llave de identidad (es pública, no es la llave secreta).
   - Con CONFIG.bold.firmaUrl el total llega firmado; sin ella, el cliente escribe el total en Bold (se le copia).
   - La llave secreta de Bold NUNCA va en este código. */
import { CONFIG } from "../data/catalogo";

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
export interface RegresoBold { ref: string; estado: string }

/** Abre el pago. Devuelve "copiado" si el cliente debe pegar el total en Bold. */
export async function abrirBold(ref: string, total: number, descripcion: string): Promise<"firmado" | "copiado"> {
  const venta: VentaBold = { currency: "COP", apiKey: CONFIG.bold.llave, description: descripcion };
  // Bold solo acepta direcciones de regreso con https (la página publicada); en pruebas locales se omite
  if (location.protocol === "https:") venta.redirectionUrl = location.origin + location.pathname + "?pedido=" + ref;
  await cargarBold();
  let modo: "firmado" | "copiado" = "copiado";
  if (CONFIG.bold.firmaUrl) {
    const r = await fetch(CONFIG.bold.firmaUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: ref, amount: String(total), currency: "COP" })
    });
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
  regreso = propio && ESTADO.test(estado) ? { ref, estado } : null;
  // La dirección queda limpia aunque los datos no sirvan
  if (q.has("pedido") || q.has("bold-tx-status")) history.replaceState(null, "", location.pathname + location.hash);
  return regreso;
}
