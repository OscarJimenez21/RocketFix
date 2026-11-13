/* Animaciones en prueba (05/11/2026): 40 nuevas, numeradas del 1 al 40, para elegir cuáles se quedan.
   Todas vienen encendidas. El panel de revisión (components/PanelAnimaciones.tsx, solo al trabajar en local) apaga las que
   se desmarquen poniendo la clase sin-aN en <html>: el CSS de cada una empieza con :root:not(.sin-aN) y el código la
   consulta con activa(N). Cuando se elijan, las que no queden se borran junto con esta comprobación. */

export const activa = (n: number) => !document.documentElement.classList.contains(`sin-a${n}`);

/** Si la persona pidió menos movimiento en su equipo (o el navegador pidió ahorrar datos, idea 82) */
export const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.ahorro === "si";

/** Mejora: los desplazamientos «suaves» de la página (carruseles, ir al formulario…) son instantáneos para quien pidió
    menos movimiento en su equipo (el navegador no lo hace solo cuando el desplazamiento lo pide el código) */
export const suave = (): ScrollBehavior => (reducirMovimiento() ? "auto" : "smooth");
