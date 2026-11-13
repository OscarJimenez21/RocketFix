/* Idea 18 (animación 64): al abrir un producto desde su tarjeta, la foto vuela de la tarjeta a su lugar en la página del
   producto (View Transitions del navegador: Chrome, Edge y Safari 18). Donde no existe, o con «reducir movimiento», el
   enlace funciona como siempre.
   Cómo: la foto de la tarjeta tocada se nombra «foto-producto» antes de la foto de la pantalla vieja; en la pantalla nueva
   ese nombre lo tiene la foto principal del producto (clase vuelo-foto en <html>, ver index.css). */
import { flushSync } from "react-dom";
import { activa, reducirMovimiento } from "./animaciones";
import { BASE, navegar } from "./rutas";

type ConTransicion = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

/** Espera a que la página del producto ya tenga su foto (llega aparte la primera vez), máximo 250 ms.
    Mientras dura la transición el navegador deja la pantalla quieta y NO corre requestAnimationFrame: por eso se mira
    con setTimeout. (Antes se miraba con requestAnimationFrame, que nunca llegaba: la pantalla se quedaba congelada
    4 segundos, hasta que Chrome cortaba la transición. Corregido el 13/11/2026.) */
function esperarFoto(vieja: Element | null): Promise<void> {
  return new Promise(listo => {
    const inicio = performance.now();
    const mirar = () => {
      // De un producto a otro, la foto de la página anterior no cuenta: se espera la del producto nuevo
      const foto = document.querySelector("[data-foto-principal]");
      if ((foto && foto !== vieja) || performance.now() - inicio > 250) listo();
      else window.setTimeout(mirar, 16);
    };
    mirar();
  });
}

/** Para el onClick de los enlaces de la tarjeta. `foto`: el cuadro de la foto de esa tarjeta */
export function abrirConVuelo(e: React.MouseEvent<HTMLAnchorElement>, foto: HTMLElement | null) {
  const doc = document as ConTransicion;
  if (!doc.startViewTransition || !foto || !activa(64) || reducirMovimiento()) return;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const href = e.currentTarget.getAttribute("href");
  if (!href?.startsWith(BASE)) return;
  e.preventDefault();
  foto.style.setProperty("view-transition-name", "foto-producto");
  const raiz = document.documentElement;
  const vieja = document.querySelector("[data-foto-principal]");
  const t = doc.startViewTransition(async () => {
    foto.style.removeProperty("view-transition-name");
    raiz.classList.add("vuelo-foto");
    // flushSync: React dibuja la página nueva ya mismo (si la parte del producto ya está bajada), sin esperar su turno
    flushSync(() => navegar(href));
    await esperarFoto(vieja);
  });
  t.finished.finally(() => raiz.classList.remove("vuelo-foto"));
}
