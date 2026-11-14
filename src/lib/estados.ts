/* Idea 22: qué quiere decir el estado del equipo, en la ficha del producto. Son los mismos textos del glosario
   (data/ayuda.json); van aquí aparte para no cargar toda la ayuda con cada producto. estados.test.ts revisa que coincidan. */
import type { EstadoProducto } from "../types";
import { datos } from "../data/politicas.json";

/* 14/11/2026: plazos de garantía (los define el usuario en politicas.json → datos). Nuevos: 6 meses o 1 año según el
   fabricante, los primeros 3 meses directamente con la tienda; usados y open box: 3 meses; CPO: 1 año */
export const PLAZOS = {
  nuevos: datos.plazoNuevos.valor ?? "",
  directo: datos.plazoDirecto.valor ?? "",
  usados: datos.plazoUsados.valor ?? "",
  cpo: datos.plazoCPO.valor ?? "",
  reparaciones: datos.plazoReparaciones.valor ?? ""
};

/** Garantía según el estado del equipo, en una frase para la ficha del producto */
export function garantiaDe(estado: string): string {
  if (estado === "CPO") return `Garantía de ${PLAZOS.cpo}, contada desde la entrega.`;
  if (estado === "Usado" || estado === "Open box") return `Garantía de ${PLAZOS.usados} directamente con nosotros, contada desde la entrega.`;
  return `Garantía de ${PLAZOS.nuevos}: los primeros ${PLAZOS.directo} la atiendes directamente con nosotros y después con el servicio técnico autorizado de la marca.`;
}

export const EXPLICACION_ESTADO: Record<EstadoProducto, string> = {
  Nuevo: "Equipo de fábrica, sin uso, en su caja original.",
  CPO: "Equipo que ya tuvo dueño o fue devuelto, y que se revisó, se reparó si hacía falta y se probó antes de volver a venderse. Viene solo el equipo, sin caja ni accesorios; los celulares incluyen forro y vidrio templado para la pantalla.",
  "Open box": "Equipo cuya caja ya se abrió (por ejemplo, para exhibirlo o porque se devolvió sin usarse). Puede no traer todos los plásticos o accesorios originales; te contamos cuáles trae.",
  Usado: "Equipo de segunda mano. Te contamos su estado antes de cualquier pago. Viene solo el equipo, sin caja ni accesorios; los celulares incluyen forro y vidrio templado para la pantalla."
};

/* 14/11/2026 (regla del usuario): los CPO y usados traen solo el equipo, sin caja ni accesorios; si es un celular,
   se le incluye forro y vidrio templado. Devuelve null en los demás estados (Nuevo y Open box siguen como antes) */
export function incluyeSegunEstado(estado: string, tienda: string): string | null {
  if (estado !== "CPO" && estado !== "Usado") return null;
  return tienda === "cel"
    ? "El celular, con forro y vidrio templado para proteger la pantalla. No trae caja ni otros accesorios."
    : "Solo el equipo, sin caja ni accesorios.";
}

/** Explicación del estado (null si es Nuevo o un estado que no conocemos: no se inventa nada) */
export function explicarEstado(estado: string): string | null {
  if (!estado || estado === "Nuevo") return null;
  return (EXPLICACION_ESTADO as Record<string, string>)[estado] ?? null;
}
