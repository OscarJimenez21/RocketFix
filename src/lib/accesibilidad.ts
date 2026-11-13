/* Ideas 82, 84 y 85 (12/11/2026): ajustes de lectura y ahorro de datos.
   · «Letra más grande» y «Más contraste» los elige la persona; se guardan en este navegador y se aplican antes de dibujar
     la página (script de index.html), así no hay un salto al cargar.
   · «Ahorro de datos» lo pone el navegador (Chrome en Android con el ahorro activado): sin decoración de temporada y con
     menos movimiento. */
import { useEffect, useState } from "react";

export type Ajuste = "letra" | "contraste";
const AJUSTES: Record<Ajuste, { clave: string; valor: string }> = {
  letra: { clave: "rf-letra", valor: "grande" },
  contraste: { clave: "rf-contraste", valor: "alto" }
};
const EVENTO = "rf:ajuste";

const raiz = () => document.documentElement;
export const ajusteActivo = (a: Ajuste) => typeof document !== "undefined" && raiz().dataset[a] === AJUSTES[a].valor;

export function cambiarAjuste(a: Ajuste, activo: boolean) {
  const { clave, valor } = AJUSTES[a];
  if (activo) raiz().dataset[a] = valor;
  else delete raiz().dataset[a];
  try { if (activo) localStorage.setItem(clave, valor); else localStorage.removeItem(clave); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new Event(EVENTO));
}

/** Estado de un ajuste (los botones del menú y del pie se mantienen iguales) */
export function useAjuste(a: Ajuste): [boolean, (v: boolean) => void] {
  const [activo, setActivo] = useState(() => ajusteActivo(a));
  useEffect(() => {
    const leer = () => setActivo(ajusteActivo(a));
    window.addEventListener(EVENTO, leer);
    return () => window.removeEventListener(EVENTO, leer);
  }, [a]);
  return [activo, v => cambiarAjuste(a, v)];
}

/** El navegador pidió ahorrar datos (lo marca el script de index.html en <html data-ahorro="si">) */
export const ahorroDatos = () => typeof document !== "undefined" && raiz().dataset.ahorro === "si";
