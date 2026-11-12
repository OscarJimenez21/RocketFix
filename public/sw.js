/* Trabajador de la tienda (mejora 3, 12/11/2026). Lo registra src/lib/instalar.ts, solo en la página publicada.
   · Programa y estilos (assets/…, con su huella en el nombre): se guardan la primera vez y no se vuelven a pedir.
   · Fotos y logos: se muestran de la copia y se actualizan por detrás (si una foto cambia, se ve nueva en la visita siguiente).
   · Páginas y datos (precios, productos, descripciones): siempre se piden primero a internet; la copia es solo para cuando
     no hay señal. Así un precio nuevo se ve de inmediato.
   · Nada de otros sitios (WhatsApp, Bold) pasa por aquí. */
const VERSION = "rf-2026-11-12";
const FIJOS = `${VERSION}-fijos`;
const FOTOS = `${VERSION}-fotos`;
const PAGINAS = `${VERSION}-paginas`;
const BASE = new URL(self.registration.scope).pathname;
const MAX_FOTOS = 400;

self.addEventListener("install", e => {
  // La portada queda guardada desde el principio: es la que abre sin señal cualquier dirección de la tienda
  e.waitUntil(caches.open(PAGINAS).then(c => c.addAll([BASE, `${BASE}datos/productos.json`])).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k.startsWith("rf-") && !k.startsWith(VERSION)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function recortar(nombre, max) {
  const c = await caches.open(nombre);
  const claves = await c.keys();
  for (const k of claves.slice(0, Math.max(0, claves.length - max))) await c.delete(k);
}

async function primeroInternet(pedido, respaldo) {
  const c = await caches.open(PAGINAS);
  try {
    const r = await fetch(pedido);
    if (r.ok && r.type === "basic") c.put(pedido, r.clone());
    return r;
  } catch {
    const guardada = (await c.match(pedido, { ignoreSearch: true })) || (respaldo && (await c.match(respaldo)));
    if (guardada) return guardada;
    return new Response("<!doctype html><meta charset=utf-8><title>Sin conexión</title><p style='font:16px system-ui;padding:24px'>Sin conexión. Vuelve a intentarlo cuando tengas señal.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

async function primeroCopia(pedido) {
  const c = await caches.open(FIJOS);
  const guardada = await c.match(pedido);
  if (guardada) return guardada;
  const r = await fetch(pedido);
  if (r.ok && r.type === "basic") c.put(pedido, r.clone());
  return r;
}

async function copiaYActualizar(pedido, evento) {
  const c = await caches.open(FOTOS);
  const guardada = await c.match(pedido);
  const nueva = fetch(pedido).then(r => {
    if (r.ok && r.type === "basic") { c.put(pedido, r.clone()); recortar(FOTOS, MAX_FOTOS); }
    return r;
  });
  if (guardada) { evento.waitUntil(nueva.catch(() => {})); return guardada; }
  return nueva;
}

self.addEventListener("fetch", e => {
  const p = e.request;
  if (p.method !== "GET") return;
  const url = new URL(p.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;
  const ruta = url.pathname.slice(BASE.length);
  if (p.mode === "navigate") { e.respondWith(primeroInternet(p, BASE)); return; }
  if (ruta.startsWith("assets/")) { e.respondWith(primeroCopia(p)); return; }
  if (/\.(jpe?g|png|webp|avif|svg|gif|ico|woff2?)$/i.test(ruta)) { e.respondWith(copiaYActualizar(p, e)); return; }
  if (ruta.startsWith("datos/") || ruta.startsWith("descripciones/") || ruta === "manifest.webmanifest") { e.respondWith(primeroInternet(p)); return; }
});
