/* Mejora 2: las últimas 5 búsquedas de la persona, guardadas solo en su navegador. Se muestran al tocar el buscador vacío
   (con un botón para borrarlas). Ninguna se envía a ningún lado */
import { useEffect, useState } from "react";

const CLAVE = "rf-busquedas";
const MAX = 5;
const EVENTO = "rf-busquedas";

function leer(): string[] {
  try {
    const l = JSON.parse(localStorage.getItem(CLAVE) || "[]") as unknown;
    return Array.isArray(l) ? l.filter((x): x is string => typeof x === "string").slice(0, MAX) : [];
  } catch { return []; }
}

function guardar(l: string[]) {
  try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new Event(EVENTO));
}

export function anotarBusqueda(q: string) {
  const t = q.trim().replace(/\s+/g, " ").slice(0, 60);
  if (t.length < 2) return;
  guardar([t, ...leer().filter(x => x.toLowerCase() !== t.toLowerCase())].slice(0, MAX));
}

export const borrarBusquedas = () => guardar([]);

export function useBusquedasRecientes() {
  const [lista, setLista] = useState(leer);
  useEffect(() => {
    const alCambiar = () => setLista(leer());
    window.addEventListener(EVENTO, alCambiar);
    window.addEventListener("storage", alCambiar);
    return () => { window.removeEventListener(EVENTO, alCambiar); window.removeEventListener("storage", alCambiar); };
  }, []);
  return lista;
}
