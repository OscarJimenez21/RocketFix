/* Entrada de la tienda.
   Mejora de rendimiento 1 (12/11/2026): la lista de productos ya no va dentro del programa. Llega aparte
   (datos/productos.json, que index.html ya empezó a pedir desde el principio) y la tienda arranca cuando está.
   Así, cambiar un precio solo cambia ese archivo: quien vuelve a la tienda no tiene que bajar otra vez todo el programa. */
import "./index.css";
import config from "./data/config.json";

declare global {
  // Así se declara una variable global en TypeScript
  var __RF_PRODUCTOS: unknown;
}

const base = import.meta.env.BASE_URL;

/** Si no hay forma de cargar la tienda (sin internet la primera vez, por ejemplo), al menos queda cómo pedir por WhatsApp */
function sinTienda() {
  const raiz = document.getElementById("root");
  if (!raiz || raiz.childElementCount) return;
  raiz.innerHTML = `<div class="contenedor py-16 text-center"><p class="text-lg font-semibold">No pudimos cargar la tienda.</p>
    <p class="mt-2 text-tinta-2">Revisa tu conexión y vuelve a intentarlo, o escríbenos por WhatsApp.</p>
    <p class="mt-6 flex flex-wrap justify-center gap-3"><button type="button" class="btn btn-marca" onclick="location.reload()">Volver a intentar</button>
    <a class="btn btn-borde" href="https://wa.me/${encodeURIComponent(config.whatsapp)}">Escribir por WhatsApp</a></p></div>`;
}

async function arrancar() {
  const r = await fetch(`${base}datos/productos.json`);
  if (!r.ok) throw new Error(`productos.json: ${r.status}`);
  globalThis.__RF_PRODUCTOS = await r.json();
  await import("./arranque");
}

arrancar().catch(() => {
  // Un segundo intento (por ejemplo, justo después de publicar una versión nueva) y, si tampoco, el aviso
  window.setTimeout(() => { arrancar().catch(sinTienda); }, 1500);
});
