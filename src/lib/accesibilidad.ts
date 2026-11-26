/* Idea 82 (12/11/2026): ahorro de datos. Lo pone el navegador (Chrome en Android con el ahorro activado): sin decoración
   de temporada y con menos movimiento.
   25/11/2026 (usuario): se retiraron «Letra más grande» y «Más contraste» (ideas 84 y 85); index.html borra lo que
   alguien hubiera elegido antes. */

/** El navegador pidió ahorrar datos (lo marca el script de index.html en <html data-ahorro="si">) */
export const ahorroDatos = () => typeof document !== "undefined" && document.documentElement.dataset.ahorro === "si";
