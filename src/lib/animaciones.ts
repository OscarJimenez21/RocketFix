/* Animaciones en prueba (05/11/2026): 40 nuevas, numeradas del 1 al 40, para elegir cuáles se quedan.
   Todas vienen encendidas. El panel de revisión (components/PanelAnimaciones.tsx, solo al trabajar en local) apaga las que
   se desmarquen poniendo la clase sin-aN en <html>: el CSS de cada una empieza con :root:not(.sin-aN) y el código la
   consulta con activa(N). Cuando se elijan, las que no queden se borran junto con esta comprobación. */

export const activa = (n: number) => !document.documentElement.classList.contains(`sin-a${n}`);

/** Si la persona pidió menos movimiento en su equipo */
export const reducirMovimiento = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
