/* Idea 22: qué quiere decir el estado del equipo, en la ficha del producto. Son los mismos textos del glosario
   (data/ayuda.json); van aquí aparte para no cargar toda la ayuda con cada producto. estados.test.ts revisa que coincidan. */
import type { EstadoProducto } from "../types";

export const EXPLICACION_ESTADO: Record<EstadoProducto, string> = {
  Nuevo: "Equipo de fábrica, sin uso, en su caja original.",
  CPO: "Equipo que ya tuvo dueño o fue devuelto, y que se revisó, se reparó si hacía falta y se probó antes de volver a venderse. Te confirmamos su estado y accesorios por WhatsApp.",
  "Open box": "Equipo cuya caja ya se abrió (por ejemplo, para exhibirlo o porque se devolvió sin usarse). Puede no traer todos los plásticos o accesorios originales; te contamos cuáles trae.",
  Usado: "Equipo de segunda mano. Te contamos su estado antes de cualquier pago."
};

/** Explicación del estado (null si es Nuevo o un estado que no conocemos: no se inventa nada) */
export function explicarEstado(estado: string): string | null {
  if (!estado || estado === "Nuevo") return null;
  return (EXPLICACION_ESTADO as Record<string, string>)[estado] ?? null;
}
