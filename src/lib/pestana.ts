/* La pestaña del navegador acompaña a quien deja la tienda abierta:
     · Animación 44: si la persona se va a otra pestaña con productos en el carrito, el título dice «🚀 Tu carrito te
       espera (N)»; al volver, recupera el título de la página. Solo usa su propio carrito (nada inventado).
     · Animación 45: el ícono de la pestaña lleva un círculo naranja con el número de productos del carrito.
     · Animación 54: al volver a la pestaña después de un rato (10 s o más), el cohete del logo da un saltito de saludo. */
import { useEffect, useRef } from "react";
import { activa } from "./animaciones";

const AUSENCIA_SALUDO = 10_000;

/** Dibuja el ícono con el número encima (devuelve la imagen como dirección data:) */
function iconoConNumero(base: HTMLImageElement, n: number): string | null {
  const lado = 64;
  const lienzo = document.createElement("canvas");
  lienzo.width = lienzo.height = lado;
  const c = lienzo.getContext("2d");
  if (!c) return null;
  c.drawImage(base, 0, 0, lado, lado);
  const r = 17, x = lado - r - 1, y = r + 1;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = "#FF6B2C";
  c.fill();
  c.lineWidth = 3;
  c.strokeStyle = "#FFFFFF";
  c.stroke();
  c.fillStyle = "#FFFFFF";
  c.font = `bold ${n > 9 ? 18 : 24}px system-ui, sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(n > 9 ? "9+" : String(n), x, y + 1);
  return lienzo.toDataURL("image/png");
}

export function usePestanaViva(unidades: number) {
  const tituloReal = useRef<string | null>(null);
  const unidadesRef = useRef(unidades);
  unidadesRef.current = unidades;

  // Título mientras la persona está en otra pestaña
  useEffect(() => {
    let salio = 0;
    const alCambiar = () => {
      if (document.hidden) {
        salio = Date.now();
        const n = unidadesRef.current;
        if (n > 0 && activa(44)) {
          tituloReal.current = document.title;
          document.title = `🚀 Tu carrito te espera (${n})`;
        }
        return;
      }
      if (tituloReal.current !== null) { document.title = tituloReal.current; tituloReal.current = null; }
      // Saludo del cohete del logo al volver
      if (salio && Date.now() - salio >= AUSENCIA_SALUDO && activa(54) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const raiz = document.documentElement;
        raiz.classList.remove("logo-saluda");
        void raiz.offsetWidth; // reinicia la animación si ya estaba
        raiz.classList.add("logo-saluda");
        window.setTimeout(() => raiz.classList.remove("logo-saluda"), 1200);
      }
    };
    document.addEventListener("visibilitychange", alCambiar);
    return () => document.removeEventListener("visibilitychange", alCambiar);
  }, []);

  // Número en el ícono de la pestaña. Se guardan los íconos originales para devolverlos cuando el carrito queda vacío
  const originales = useRef<{ el: HTMLLinkElement; href: string; type: string }[] | null>(null);
  const base = useRef<Promise<HTMLImageElement | null> | null>(null);
  useEffect(() => {
    const iconos = [...document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')];
    if (!iconos.length) return;
    if (!originales.current) originales.current = iconos.map(el => ({ el, href: el.href, type: el.type }));
    const restaurar = () => originales.current?.forEach(o => { o.el.href = o.href; o.el.type = o.type; });
    if (unidades <= 0 || !activa(45)) { restaurar(); return; }
    const svg = originales.current.find(o => o.type === "image/svg+xml") ?? originales.current[0];
    if (!svg) return;
    base.current ??= new Promise(listo => {
      const img = new Image();
      img.onload = () => listo(img);
      img.onerror = () => listo(null);
      img.src = svg.href;
    });
    let vigente = true;
    void base.current.then(img => {
      if (!vigente || !img) return;
      const dato = iconoConNumero(img, unidades);
      if (dato) originales.current?.forEach(o => { o.el.href = dato; o.el.type = "image/png"; });
    });
    return () => { vigente = false; };
  }, [unidades]);
}
