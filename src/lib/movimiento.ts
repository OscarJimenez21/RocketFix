/* Piezas de movimiento compartidas: el temblor de los campos que faltan y el marco que se desliza a la opción elegida */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

/** Clase para que un campo marcado tiemble al intentar enviar. `intento` cuenta los envíos fallidos: al alternar entre dos
    animaciones iguales, el temblor se repite en cada intento (ver .temblar-1 y .temblar-2 en index.css) */
export const temblor = (marcado: boolean, intento: number) => (marcado && intento ? (intento % 2 ? " temblar-1" : " temblar-2") : "");

/** Hacia dónde cambió un número la última vez: 1 si subió, -1 si bajó, 0 si no ha cambiado desde que se montó
    (para que el precio nuevo ruede hacia arriba o hacia abajo) */
export function useDireccion(valor: number) {
  const [paso, setPaso] = useState({ valor, dir: 0 });
  if (paso.valor !== valor) {
    const dir = valor > paso.valor ? 1 : -1;
    setPaso({ valor, dir });
    return dir;
  }
  return paso.dir;
}

/** Posición y tamaño de la opción número `i` (las que llevan data-opcion) dentro de `raiz` */
function medirOpcion(raiz: HTMLElement | null, i: number) {
  const el = raiz?.querySelectorAll<HTMLElement>("[data-opcion]")[i];
  return el ? { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight } : null;
}

/** Marco que se desliza hasta la opción elegida dentro de un contenedor con position: relative. Las opciones llevan
    data-opcion, en orden. Devuelve el estilo del marco, o null mientras no se ha medido (hasta entonces la opción elegida
    lleva su propio borde). La primera medida y los cambios de tamaño no se animan: el marco aparece ya en su lugar. */
export function useMarco(contenedor: RefObject<HTMLElement | null>, indice: number): CSSProperties | null {
  const [caja, setCaja] = useState<{ x: number; y: number; w: number; h: number; animar: boolean } | null>(null);
  const medido = useRef(false);
  // La opción elegida, para el aviso de cambio de tamaño (se anota en el efecto de abajo, no al dibujar)
  const actual = useRef(indice);

  // Al cambiar de opción: se desliza (menos la primera vez, que aparece en su lugar)
  useLayoutEffect(() => {
    actual.current = indice;
    const m = medirOpcion(contenedor.current, indice);
    // Medir la página ya dibujada solo se puede en un efecto (antes de pintar, para que el marco no salte)
    if (m) setCaja({ ...m, animar: medido.current });
    medido.current = true;
  }, [indice, contenedor]);

  // Si el contenedor cambia de tamaño (girar el celular, otra letra), el marco se acomoda sin animarse.
  // ResizeObserver avisa una vez al empezar a observar: ese primer aviso se ignora
  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz || !("ResizeObserver" in window)) return;
    let primero = true;
    const observador = new ResizeObserver(() => {
      if (primero) { primero = false; return; }
      const m = medirOpcion(raiz, actual.current);
      if (m) setCaja({ ...m, animar: false });
    });
    observador.observe(raiz);
    return () => observador.disconnect();
  }, [contenedor]);

  if (!caja) return null;
  const curva = "260ms cubic-bezier(0.23, 1, 0.32, 1)";
  return {
    width: caja.w, height: caja.h, transform: `translate(${caja.x}px, ${caja.y}px)`,
    transition: caja.animar ? `transform ${curva}, width ${curva}, height ${curva}` : "none"
  };
}
