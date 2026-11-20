/* 19/11/2026: en la portada, los tramos de más abajo se arman solo cuando la persona se acerca (una pantalla y media
   antes de llegar). En un celular viejo la portada armaba de una vez más de 4.500 elementos y se trababa al abrir.
   Mientras tanto, un espacio de alto parecido guarda el lugar (el pie no sube y la barra de desplazamiento no salta) y
   lleva los mismos id de las secciones, para que la barra de secciones y los enlaces #… las encuentren.
   Una vez armado, el tramo se queda. Se arma todo de una vez: al abrir la portada en una sección (#marcas…), al regresar
   con «atrás» (para volver al mismo punto), al tocar la barra de secciones (montarTodo) y si el navegador no tiene
   IntersectionObserver. */
import { useEffect, useRef, useState, type ReactNode } from "react";

let todo = false;
const avisos = new Set<() => void>();

/** Arma todos los tramos que faltan (antes de bajar hasta una sección, para que el punto de llegada no se mueva) */
export function montarTodo() {
  todo = true;
  avisos.forEach(f => f());
}
/** Al salir de la portada: la próxima visita vuelve a armar por tramos */
export function reiniciarDiferidos() {
  todo = false;
}

export function Diferido({ ids = [], alto, ya = false, children }: {
  /** id de las secciones que hay dentro (el primero va en el espacio y los demás en marcas vacías) */
  ids?: string[];
  /** Alto aproximado del tramo, en clases de Tailwind (celular y computador) */
  alto: string;
  /** Armarlo de una vez */
  ya?: boolean;
  children: ReactNode;
}) {
  const [listo, setListo] = useState(() => ya || todo || typeof IntersectionObserver === "undefined");
  const caja = useRef<HTMLDivElement>(null);
  if (ya && !listo) setListo(true);

  useEffect(() => {
    if (listo) return;
    const armar = () => setListo(true);
    avisos.add(armar);
    const observador = new IntersectionObserver(e => { if (e.some(x => x.isIntersecting)) armar(); }, { rootMargin: "150% 0px" });
    if (caja.current) observador.observe(caja.current);
    return () => { avisos.delete(armar); observador.disconnect(); };
  }, [listo]);

  if (listo) return <>{children}</>;
  const [primero, ...resto] = ids;
  return (
    <div ref={caja} id={primero} aria-hidden="true" className={alto}>
      {resto.map(i => <span key={i} id={i} />)}
    </div>
  );
}
