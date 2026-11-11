/* Franja de arriba en diciembre (ver REGALOS en lib/temporada.ts): lleva a «Regalos por presupuesto» de la portada.
   Va encima de la cabecera y se va al bajar (la cabecera sigue fija). No anuncia descuentos ni fechas de entrega:
   solo invita a ver las ideas de regalo. */
import { REGALOS } from "../lib/temporada";
import { IconoFlecha, IconoRegalo } from "./Iconos";

export function FranjaRegalos() {
  if (!REGALOS) return null;
  return (
    <a href="#regalos" className="group block bg-marca-noche text-white">
      <span className="contenedor flex min-h-[40px] items-center justify-center gap-2 py-2 text-center text-[13px] sm:text-sm">
        <IconoRegalo className="h-4 w-4 shrink-0 text-[#FFD36B]" />
        <span><b className="font-semibold">{REGALOS.navidad ? "Regalos de Navidad" : "Regalos de fin de año"}</b><span className="hidden sm:inline">: ideas por presupuesto y por persona</span></span>
        <span className="inline-flex items-center gap-0.5 font-semibold text-[#FFD36B] underline-offset-2 group-hover:underline">Ver regalos<IconoFlecha className="h-3.5 w-3.5 transition-transform duration-200 ease-salida group-hover:translate-x-0.5" /></span>
      </span>
    </a>
  );
}
