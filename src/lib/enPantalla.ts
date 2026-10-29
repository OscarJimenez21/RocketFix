import { useEffect, useState, type RefObject } from "react";

/** Si el elemento se ve (aunque sea en parte) en la pantalla. Sirve para pausar lo que se mueve solo mientras nadie lo
    está viendo: así no gasta batería ni procesador en el celular. Sin IntersectionObserver se considera siempre visible. */
export function useEnPantalla(ref: RefObject<Element>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setVisible(true); return; }
    const observador = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)));
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref]);
  return visible;
}
