/* Textos de las políticas (data/politicas.json) con sus datos: {titular}, {correo}… se llenan con «datos» y
   {whatsapp}/{nombre} con config.json. Un dato que todavía no está se ve resaltado, para que nadie lo pase por alto. */
import politicas from "../data/politicas.json";
import { CONFIG } from "../data/catalogo";

export type BloqueLegal = string | { lista: string[]; numerada?: boolean };
export interface PaginaLegal { id: string; menu: string; titulo: string; lead: string; secciones: { titulo: string; bloques: BloqueLegal[] }[] }

const DATOS = politicas.datos as Record<string, { etiqueta: string; valor: string | null }>;
const FIJOS: Record<string, string> = { whatsapp: CONFIG.whatsappVisible, nombre: CONFIG.nombre };
export const POLITICAS = politicas.paginas as PaginaLegal[];
export const datoLegal = (clave: string) => FIJOS[clave] ?? DATOS[clave]?.valor ?? null;
/** Datos que faltan por llenar (mientras haya alguno, las políticas son un borrador) */
export const DATOS_FALTANTES = Object.values(DATOS).filter(d => !d.valor).map(d => d.etiqueta);

export function TextoLegal({ t }: { t: string }) {
  // Las posiciones impares de la división son los nombres de los datos
  return <>{t.split(/\{(\w+)\}/).map((parte, i) => {
    if (i % 2 === 0) return parte;
    return datoLegal(parte) ?? <mark key={i} className="rounded bg-acento-suave px-1 font-semibold text-acento-texto">[{DATOS[parte]?.etiqueta ?? parte}]</mark>;
  })}</>;
}
