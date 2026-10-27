import { CONFIG } from "../data/catalogo";

/** Enlace que abre WhatsApp con el mensaje escrito (lo envía la persona, nunca la página) */
export const waLink = (texto?: string) =>
  `https://wa.me/${CONFIG.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;

/** Reemplaza {nombre} por el nombre de la tienda, como en los textos de la tienda original */
export const conNombre = (texto: string) => texto.replace(/\{nombre\}/g, CONFIG.nombre);
