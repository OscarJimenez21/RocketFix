/* Franja de arriba en cada temporada (lib/temporada.ts; antes solo existía la de diciembre). Va encima de la cabecera y
   se va al bajar (la cabecera sigue fija). En las temporadas de regalos lleva a la sección «por presupuesto» de la portada;
   en fiestas patrias y Halloween solo saluda. No anuncia descuentos ni fechas de entrega. */
import { lazy, Suspense } from "react";
import { TEMPORADA, DECORAR } from "../lib/temporada";
import { hrefDe } from "../lib/rutas";
import { IconoFlecha, IconoRegalo } from "./Iconos";

const Decoracion = DECORAR ? lazy(() => import("./temporada/Decoracion")) : null;

export function FranjaTemporada() {
  if (!TEMPORADA) return null;
  const { franja, fondo, acento } = TEMPORADA;
  const colores = { "--t-fondo": fondo, "--t-acento": acento } as React.CSSProperties;
  const contenido = (
    <span className="contenedor relative flex min-h-[40px] items-center justify-center gap-2 py-2 text-center text-[13px] sm:text-sm">
      {franja.ver && <IconoRegalo className="h-4 w-4 shrink-0 text-[var(--t-acento)]" />}
      <span><b className="font-semibold">{franja.texto}</b>{franja.mas && <span className="hidden sm:inline">{franja.mas}</span>}</span>
      {franja.ver && <span className="inline-flex items-center gap-0.5 font-semibold text-[var(--t-acento)] underline-offset-2 group-hover:underline">{franja.ver}<IconoFlecha className="h-3.5 w-3.5 transition-transform duration-200 ease-salida group-hover:translate-x-0.5" /></span>}
    </span>
  );
  const deco = Decoracion && <Suspense fallback={null}><Decoracion donde="franja" /></Suspense>;
  return franja.ver
    ? <a href={hrefDe("presupuesto")} style={colores} className="group relative block bg-[var(--t-fondo)] text-white">{deco}{contenido}</a>
    : <div style={colores} className="relative bg-[var(--t-fondo)] text-white">{deco}{contenido}</div>;
}
