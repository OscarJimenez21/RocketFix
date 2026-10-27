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
    const { hash } = (await r.json()) as { hash: string };
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
    de la dirección, así que una segunda lectura (React la repite en modo de desarrollo) devuelve el mismo resultado. */
let regreso: { ref: string; estado: string } | null | undefined;
export function leerRegresoBold(): { ref: string; estado: string } | null {
  if (regreso !== undefined) return regreso;
  const q = new URLSearchParams(location.search);
  const ref = q.get("pedido"), estado = q.get("bold-tx-status");
  regreso = ref && estado ? { ref, estado } : null;
  if (regreso) history.replaceState(null, "", location.pathname + location.hash);
  return regreso;
}
