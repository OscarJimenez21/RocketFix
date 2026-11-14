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

/** Visitas (14/11/2026): Cloudflare Web Analytics, sin cookies ni datos personales. Solo en la tienda publicada y
    cuando config.json trae el token; se carga después de la página para no quitarle velocidad. */
function medirVisitas() {
  const token = config.analitica?.cloudflare;
  if (!import.meta.env.PROD || !token) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token, spa: true }));
  document.head.appendChild(s);
}
/** Antifraude (14/11/2026): la tienda no se deja mostrar dentro de otra página. Un sitio falso podría ponerla en un marco
    con su propio número de WhatsApp o sus datos de pago alrededor. GitHub Pages no permite el encabezado que lo prohíbe
    (y la etiqueta <meta> no sirve para eso), así que se revisa aquí: si está dentro de un marco, en vez de la tienda
    aparece un enlace para abrirla en su dirección real. */
function dentroDeOtraPagina() {
  try { return window.top !== window.self; } catch { return true; }
}
function mostrarSalida() {
  const raiz = document.getElementById("root");
  if (!raiz) return;
  const caja = document.createElement("div");
  caja.className = "contenedor py-16 text-center";
  const p = document.createElement("p");
  p.className = "text-lg font-semibold";
  p.textContent = `Abre ${config.nombre} en su propia dirección para comprar con seguridad.`;
  const a = document.createElement("a");
  a.className = "btn btn-marca mt-6";
  a.href = location.href;
  a.target = "_top";
  a.rel = "noopener";
  a.textContent = `Ir a ${config.nombre}`;
  caja.append(p, a);
  raiz.replaceChildren(caja);
}

if (dentroDeOtraPagina()) {
  mostrarSalida();
} else {
  if (document.readyState === "complete") medirVisitas();
  else window.addEventListener("load", medirVisitas, { once: true });

  arrancar().catch(() => {
    // Un segundo intento (por ejemplo, justo después de publicar una versión nueva) y, si tampoco, el aviso
    window.setTimeout(() => { arrancar().catch(sinTienda); }, 1500);
  });
}
