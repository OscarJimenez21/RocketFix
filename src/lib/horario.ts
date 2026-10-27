/* Estado de atención (abierto / cerrado) según el horario de la configuración */
import { CONFIG } from "../data/catalogo";

export const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const minutos = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const hora = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(CONFIG.idioma, { hour: "numeric", minute: "2-digit" });
};
const turno = (dia: number) => CONFIG.horario.find(t => t.dias.includes(dia) && t.abre);

export function estadoAtencion(ahora = new Date()): { abierto: boolean; texto: string } {
  const d = ahora.getDay();
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = turno(d);
  if (hoy?.abre && hoy.cierra && m >= minutos(hoy.abre) && m < minutos(hoy.cierra)) return { abierto: true, texto: `Abierto ahora · hasta ${hora(hoy.cierra)}` };
  if (hoy?.abre && m < minutos(hoy.abre)) return { abierto: false, texto: `Cerrado · abre hoy ${hora(hoy.abre)}` };
  for (let i = 1; i <= 7; i++) {
    const t = turno((d + i) % 7);
    if (t?.abre) return { abierto: false, texto: `Cerrado · abre ${i === 1 ? "mañana" : "el " + DIAS[(d + i) % 7]} ${hora(t.abre)}` };
  }
  return { abierto: false, texto: "Sin atención" };
}

/** Filas del horario para mostrar: [días, horas] */
export const filasHorario = () =>
  CONFIG.horario.map(t => [t.etiqueta, t.abre && t.cierra ? `${hora(t.abre)} – ${hora(t.cierra)}` : "Cerrado"] as const);
