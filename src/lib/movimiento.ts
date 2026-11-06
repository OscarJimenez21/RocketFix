/* Piezas de movimiento compartidas: el temblor de los campos que faltan y el marco que se desliza a la opción elegida */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";

/** Clase para que un campo marcado tiemble al intentar enviar. `intento` cuenta los envíos fallidos: al alternar entre dos
    animaciones iguales, el temblor se repite en cada intento (ver .temblar-1 y .temblar-2 en index.css) */
export const temblor = (marcado: boolean, intento: number) => (marcado && intento ? (intento % 2 ? " temblar-1" : " temblar-2") : "");

/** Marco que se desliza hasta la opción elegida dentro de un contenedor con position: relative. Las opciones llevan
    data-opcion, en orden. Devuelve el estilo del marco, o null mientras no se ha medido (hasta entonces la opción elegida
    lleva su propio borde). La primera medida y los cambios de tamaño no se animan: el marco aparece ya en su lugar. */
export function useMarco(contenedor: RefObject<HTMLElement>, indice: number): CSSProperties | null {
  const [caja, setCaja] = useState<{ x: number; y: number; w: number; h: number; animar: boolean } | null>(null);
  const medido = useRef(false);
  const actual = useRef(indice);
  actual.current = indice;

  const medir = useCallback((animar: boolean) => {
    const el = contenedor.current?.querySelectorAll<HTMLElement>("[data-opcion]")[actual.current];
    if (el) setCaja({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, animar });
  }, [contenedor]);

  // Al cambiar de opción: se desliza (menos la primera vez, que aparece en su lugar)
  useLayoutEffect(() => {
    medir(medido.current);
    medido.current = true;
  }, [indice, medir]);

  // Si el contenedor cambia de tamaño (girar el celular, otra letra), el marco se acomoda sin animarse.
  // ResizeObserver avisa una vez al empezar a observar: ese primer aviso se ignora
  useEffect(() => {
    const raiz = contenedor.current;
    if (!raiz || !("ResizeObserver" in window)) return;
    let primero = true;
    const observador = new ResizeObserver(() => { if (primero) primero = false; else medir(false); });
    observador.observe(raiz);
    return () => observador.disconnect();
  }, [contenedor, medir]);

  if (!caja) return null;
  const curva = "260ms cubic-bezier(0.23, 1, 0.32, 1)";
  return {
    width: caja.w, height: caja.h, transform: `translate(${caja.x}px, ${caja.y}px)`,
    transition: caja.animar ? `transform ${curva}, width ${curva}, height ${curva}` : "none"
  };
}
