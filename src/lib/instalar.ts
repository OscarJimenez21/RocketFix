/* Mejora 3 (12/11/2026): la tienda como aplicación.
   · public/sw.js guarda una copia de lo que ya se bajó: la segunda visita abre más rápido y, sin señal, la tienda abre
     con lo último que se vio (los pedidos igual se envían por WhatsApp cuando vuelva la señal).
   · «Instalar la tienda»: Chrome, Edge y Android avisan cuando se puede instalar; ahí aparece el botón en el pie de página.
     En iPhone no existe ese aviso: se instala desde Compartir → «Agregar a inicio» (el botón no aparece). */
import { useEffect, useState } from "react";

type AvisoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let aviso: AvisoInstalar | null = null;
const avisar = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    aviso = e as AvisoInstalar;
    avisar.forEach(f => f());
  });
  window.addEventListener("appinstalled", () => {
    aviso = null;
    avisar.forEach(f => f());
  });
}

/** Registra public/sw.js (solo en la página publicada: al trabajar en local estorbaría los cambios) */
export function registrarTrabajador() {
  if (import.meta.env.DEV || !("serviceWorker" in navigator)) return;
  const registrar = () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => { /* sin trabajador: la tienda funciona igual */ });
  };
  if (document.readyState === "complete") registrar();
  else window.addEventListener("load", registrar, { once: true });
}

/** Función para instalar la tienda, o null si el navegador no lo ofrece (o ya está instalada) */
export function useInstalar(): (() => void) | null {
  const [, setVuelta] = useState(0);
  useEffect(() => {
    const f = () => setVuelta(n => n + 1);
    avisar.add(f);
    return () => { avisar.delete(f); };
  }, []);
  if (!aviso) return null;
  return () => {
    const a = aviso;
    if (!a) return;
    void a.prompt();
    void a.userChoice.finally(() => { aviso = null; avisar.forEach(f => f()); });
  };
}
