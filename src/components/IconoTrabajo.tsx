/* Idea 26: ícono de línea para cada trabajo del servicio técnico, según lo que dice el texto («Cambio de batería»,
   «Recuperación de archivos»…). Mismo trazo que los demás íconos. Si el texto no se reconoce, va el ✓ de siempre */
import { norm } from "../lib/formato";

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

const DIBUJOS: [RegExp, JSX.Element][] = [
  [/diagnostico|revision|visita tecnica|medir/, <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5M8 10.5h5M10.5 8v5" /></>],
  [/formateo|windows|programas/, <><rect x="3" y="4" width="18" height="13" rx="1.5" /><path d="M8 20h8M12 17v3M7.5 8l2.5 2.5L7.5 13M12 13h4" /></>],
  [/limpieza|pasta termica/, <><circle cx="12" cy="12" r="2" /><path d="M12 10c0-4 1-6 3.5-6S18 7 12 10zM14 12c4 0 6 1 6 3.5S17 18 14 12zM12 14c0 4-1 6-3.5 6S6 17 12 14zM10 12c-4 0-6-1-6-3.5S7 6 10 12z" /></>],
  [/bateria/, <><rect x="2.5" y="7.5" width="17" height="9" rx="2" /><path d="M21.5 10.5v3M11.5 9.5l-2 3h3l-2 3" /></>],
  [/pantalla|vidrio/, <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><path d="M9.5 7.5l5 5M9.5 11.5l3 3" /></>],
  [/ssd|ram|memoria/, <><rect x="3" y="7" width="18" height="9" rx="1" /><path d="M7 10v3M11 10v3M15 10v3M6 16v2.5M10 16v2.5M14 16v2.5M18 16v2.5" /></>],
  [/recuperacion|archivos/, <><path d="M3.5 7.5V18a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5V9.5A1.5 1.5 0 0 0 19 8h-7l-2-2.5H5A1.5 1.5 0 0 0 3.5 7v.5" /><path d="M12 11v5M9.5 13.5 12 11l2.5 2.5" /></>],
  [/puerto|microfono|altavoz/, <><path d="M9 3.5v4M15 3.5v4M6.5 7.5h11V11a5.5 5.5 0 0 1-11 0zM12 16.5v4" /></>],
  [/mojad|no encienden/, <><path d="M12 3.5s6 6.6 6 10.5a6 6 0 0 1-12 0c0-3.9 6-10.5 6-10.5z" /><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" /></>],
  [/copia de seguridad|fotos y contactos/, <><path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 9z" /><path d="M12 16v-5M9.5 13.5 12 11l2.5 2.5" /></>],
  [/kits|grabador/, <><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 17h.01M10 17h4M6 10.5l3-5h6l3 5z" /></>],
  [/wifi|camaras wifi/, <><path d="M5 10a10 10 0 0 1 14 0M8 13a5.6 5.6 0 0 1 8 0" /><circle cx="12" cy="16.5" r="1.4" /></>],
  [/app|configuracion/, <><rect x="6.5" y="2.5" width="11" height="19" rx="2.5" /><circle cx="12" cy="11" r="2.3" /><path d="M12 6.8v1.4M12 13.8v1.4M7.8 11h1.4M14.8 11h1.4" /></>],
  [/mantenimiento|reubicacion/, <><path d="M14.5 6.5a4 4 0 0 0-5.3 5.3l-5.7 5.7 2 2 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.4 2.4-2-2z" /></>]
];

const CHECK = <path d="M5 12.5l4.5 4.5L19 7.5" />;

export function IconoTrabajo({ texto, className = "h-3.5 w-3.5" }: { texto: string; className?: string }) {
  const t = norm(texto);
  const dibujo = DIBUJOS.find(([re]) => re.test(t))?.[1] ?? CHECK;
  return <svg viewBox="0 0 24 24" className={className} {...base}>{dibujo}</svg>;
}
