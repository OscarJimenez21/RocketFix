/* Idea 30: modo noche. Es opcional: la tienda abre de día, como siempre, y cada visitante elige «Noche» o «Según mi
   teléfono» (sigue el ajuste claro/oscuro del celular o computador). La elección queda guardada en este navegador.
   Se aplica antes de pintar la página (main.tsx), para que no se vea un destello blanco al abrirla de noche */
import { useEffect, useState } from "react";
import { activa, reducirMovimiento } from "./animaciones";

export type Tema = "claro" | "noche" | "auto";
const CLAVE = "rf-tema";
const OSCURO = "(prefers-color-scheme: dark)";
// Color de la barra del navegador en el celular: el de la cabecera en cada modo
const BARRA = { claro: "#FFFFFF", noche: "#0D2019" };

export function temaGuardado(): Tema {
  try {
    const t = localStorage.getItem(CLAVE);
    return t === "noche" || t === "auto" ? t : "claro";
  } catch {
    return "claro";
  }
}

const esNoche = (t: Tema) => t === "noche" || (t === "auto" && typeof matchMedia === "function" && matchMedia(OSCURO).matches);

export function aplicarTema(t: Tema = temaGuardado()) {
  const noche = esNoche(t);
  const raiz = document.documentElement;
  if (noche) raiz.dataset.tema = "noche";
  else delete raiz.dataset.tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", noche ? BARRA.noche : BARRA.claro);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", noche ? "dark" : "light");
}

/** El tema elegido y la función para cambiarlo. En «Según mi teléfono», sigue al ajuste del equipo si cambia con la página abierta */
export function useTema(): [Tema, (t: Tema, origen?: { x: number; y: number }) => void] {
  const [tema, setTema] = useState<Tema>(temaGuardado);
  useEffect(() => {
    aplicarTema(tema);
    if (tema !== "auto" || typeof matchMedia !== "function") return;
    const mq = matchMedia(OSCURO);
    const cambio = () => aplicarTema("auto");
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, [tema]);
  // Si se cambia en otro lugar de la página (el menú y el pie tienen el mismo selector), todos se enteran
  useEffect(() => {
    const oir = (e: Event) => setTema((e as CustomEvent<Tema>).detail);
    window.addEventListener("rf-tema", oir);
    return () => window.removeEventListener("rf-tema", oir);
  }, []);
  const elegir = (t: Tema, origen?: { x: number; y: number }) => {
    try { localStorage.setItem(CLAVE, t); } catch { /* sin almacenamiento: dura mientras la página siga abierta */ }
    const cambiar = () => {
      aplicarTema(t);
      setTema(t);
      window.dispatchEvent(new CustomEvent<Tema>("rf-tema", { detail: t }));
    };
    // Animación 73: los colores nuevos se abren en círculo desde el botón tocado (Chrome, Edge y Safari 18).
    // Si no cambia el color de verdad (p. ej. «Automático» con el teléfono de día), no hay círculo
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
    const raiz = document.documentElement;
    if (!doc.startViewTransition || !activa(73) || reducirMovimiento() || esNoche(t) === (raiz.dataset.tema === "noche")) { cambiar(); return; }
    const x = origen?.x ?? innerWidth / 2, y = origen?.y ?? 0;
    raiz.style.setProperty("--tx", `${x}px`);
    raiz.style.setProperty("--ty", `${y}px`);
    raiz.style.setProperty("--tr", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    raiz.classList.add("cambio-tema");
    doc.startViewTransition(cambiar).finished.finally(() => raiz.classList.remove("cambio-tema"));
  };
  return [tema, elegir];
}
