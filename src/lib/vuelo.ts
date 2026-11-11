/* Al agregar un producto, una miniatura de su foto despega desde el botón y vuela en curva hasta el carrito de la cabecera
   (como el cohete de la portada). Cuando llega, el contador del carrito da su salto.
   No se puede tocar, no bloquea nada y los lectores de pantalla no lo ven. Con «reducir movimiento», o en navegadores que
   no mueven cosas por una curva, no vuela: el contador salta de una vez. */

/** Cuántas miniaturas van en el aire: mientras haya alguna, la cabecera espera a que aterrice para hacer saltar el contador */
let enElAire = 0;
export const hayVuelo = () => enElAire > 0;
/** Evento que la cabecera escucha para hacer saltar el contador */
export const ATERRIZAJE = "rf:aterrizaje";

const TAM = 56;

/** `desde`: de dónde puede despegar, en orden de preferencia (la foto del producto y, si no se ve entera, el botón) */
export function volarAlCarrito(desde: (Element | null | undefined)[], foto: string | null | undefined) {
  if (!foto) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.CSS?.supports?.("offset-path", "path('M 0 0 L 1 1')")) return;
  // El contador del carrito de la cabecera (si no se ve, no hay a dónde volar)
  const destino = document.querySelector<HTMLElement>("[data-destino-carrito]");
  const b = destino?.getBoundingClientRect();
  if (!b || !b.width || b.bottom < 0) return;
  // Se ve entera: ni tapada por la cabecera fija ni cortada abajo
  const tope = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
  const enVista = (r: DOMRect) => r.width > 0 && r.top >= tope && r.bottom <= window.innerHeight;
  const a = desde.map(e => e?.getBoundingClientRect()).find((r): r is DOMRect => r !== undefined && enVista(r));
  if (!a) return;

  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  // Primero sube (como un despegue) y luego se curva hacia el carrito
  const alto = Math.max(80, Math.min(220, (y0 - y1) * 0.5));
  const r = Math.round;
  const d = `M ${r(x0)} ${r(y0)} C ${r(x0)} ${r(y0 - alto)}, ${r(x1 - (x1 - x0) * 0.15)} ${r(y1 + alto * 0.35)}, ${r(x1)} ${r(y1)}`;

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:fixed;left:0;top:0;z-index:70;width:${TAM}px;height:${TAM}px;pointer-events:none;border-radius:12px;` +
    `background:#fff;padding:6px;box-shadow:0 12px 32px -8px rgba(15,31,24,.35);offset-path:path("${d}");offset-rotate:0deg;opacity:0`;
  const img = document.createElement("img");
  img.src = foto;
  img.alt = "";
  img.style.cssText = "width:100%;height:100%;object-fit:contain";
  el.appendChild(img);
  document.body.appendChild(el);

  enElAire++;
  // Arranca lento y acelera, como el cohete; se achica al acercarse y se desvanece justo al llegar
  const vuelo = el.animate([
    { offsetDistance: "0%", transform: "scale(0.6)", opacity: 0 },
    { transform: "scale(1)", opacity: 1, offset: 0.15 },
    { opacity: 1, offset: 0.8 },
    { offsetDistance: "100%", transform: "scale(0.3)", opacity: 0 }
  ], { duration: 480, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "forwards" });
  const fin = () => {
    el.remove();
    enElAire = Math.max(0, enElAire - 1);
    window.dispatchEvent(new Event(ATERRIZAJE));
  };
  vuelo.finished.then(fin, fin);
}
