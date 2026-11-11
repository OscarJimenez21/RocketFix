/* Partes de la página que se bajan aparte (producto, búsqueda, blog…).
   · Mejora 14: después de cada publicación, quien tenía la tienda abierta pide archivos que ya no existen y la página
     mostraba «No pudimos mostrar esta página». Ahora, si falla la descarga de una parte, la página se recarga sola una vez
     (con la versión nueva). Si vuelve a fallar en menos de un minuto, ya no insiste y se muestra el aviso de siempre.
   · Mejora 15: la página de producto se baja antes de abrirla: al pasar el mouse o poner el dedo sobre un producto, y en
     los ratos libres del navegador después de abrir la tienda (salvo con «ahorro de datos» activado). */

import { recurso } from "./formato";

const CLAVE = "rf-recarga";
const FALLO_DE_CARGA = /dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch|Unable to preload/i;

export function conReintento<T>(cargar: () => Promise<T>): () => Promise<T> {
  return () => cargar().catch((error: unknown) => {
    let antes = 0;
    try { antes = Number(sessionStorage.getItem(CLAVE)) || 0; } catch { /* sin almacenamiento */ }
    if (FALLO_DE_CARGA.test(String(error)) && Date.now() - antes > 60_000) {
      try { sessionStorage.setItem(CLAVE, String(Date.now())); } catch { /* sin almacenamiento */ }
      location.reload();
      return new Promise<T>(() => { /* la página se está recargando */ });
    }
    throw error;
  });
}

export const cargarProducto = conReintento(() => import("../paginas/Producto"));

let pedido = false;
/** Baja la página de producto una sola vez (las siguientes llamadas no hacen nada) */
export function precargarProducto() {
  if (pedido) return;
  pedido = true;
  cargarProducto().catch(() => { pedido = false; });
}

/** En los ratos libres del navegador, unos segundos después de abrir la tienda */
export function precargarEnReposo() {
  const red = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (red?.saveData || red?.effectiveType === "2g" || red?.effectiveType === "slow-2g") return;
  const ocioso = (window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  window.setTimeout(() => (ocioso ? ocioso(precargarProducto, { timeout: 4000 }) : precargarProducto()), 3500);
}

/** Mejora: la foto grande de un producto, pedida un momento antes de abrirlo (al dejar el mouse encima de su tarjeta 250 ms).
    Una sola vez por foto, y nunca con «ahorro de datos» */
const pedidas = new Set<string>();
let espera = 0;
export function precargarFoto(imagen?: string | null) {
  const red = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (!imagen || pedidas.has(imagen) || red?.saveData) return;
  window.clearTimeout(espera);
  espera = window.setTimeout(() => { pedidas.add(imagen); new Image().src = recurso(imagen); }, 250);
}

/** Mejora: la página de resultados se baja al tocar el buscador, antes de terminar de escribir */
let buscarPedido = false;
export function precargarBuscar() {
  if (buscarPedido) return;
  buscarPedido = true;
  import("../paginas/Buscar").catch(() => { buscarPedido = false; });
}
