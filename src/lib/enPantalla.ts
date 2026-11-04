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

/** Si el elemento ya entró en pantalla alguna vez (después no vuelve a falso): para animar su entrada una sola vez.
    Cuenta como visto cuando su borde superior pasa la línea del 85 % de la pantalla. Sin IntersectionObserver, visto de una vez. */
export function useVisto(ref: RefObject<Element>) {
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setVisto(true); return; }
    const observador = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) { setVisto(true); observador.disconnect(); }
    }, { rootMargin: "0px 0px -15% 0px" });
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref]);
  return visto;
}
