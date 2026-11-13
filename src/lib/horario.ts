/* Estado de atención (abierto / cerrado) según el horario de la configuración.
   Idea 100: los festivos de Colombia (lib/festivos.ts) cuentan como cerrados, igual que el domingo («Domingo y festivos»). */
import { CONFIG } from "../data/catalogo";
import { festivo } from "./festivos";

export const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const minutos = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const hora = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(CONFIG.idioma, { hour: "numeric", minute: "2-digit" });
};
/** Turno de un día (null los festivos) */
const turno = (fecha: Date) => (festivo(fecha) ? undefined : CONFIG.horario.find(t => t.dias.includes(fecha.getDay()) && t.abre));

export function estadoAtencion(ahora = new Date()): { abierto: boolean; texto: string } {
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  const hoy = turno(ahora);
  if (hoy?.abre && hoy.cierra && m >= minutos(hoy.abre) && m < minutos(hoy.cierra)) return { abierto: true, texto: `Abierto ahora · hasta ${hora(hoy.cierra)}` };
  if (hoy?.abre && m < minutos(hoy.abre)) return { abierto: false, texto: `Cerrado · abre hoy ${hora(hoy.abre)}` };
  const motivo = festivo(ahora) ? "Hoy es festivo" : "Cerrado";
  for (let i = 1; i <= 14; i++) {
    const dia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
    const t = turno(dia);
    if (t?.abre) return { abierto: false, texto: `${motivo} · abre ${i === 1 ? "mañana" : i < 7 ? "el " + DIAS[dia.getDay()] : `el ${dia.getDate()}/${dia.getMonth() + 1}`} ${hora(t.abre)}` };
  }
  return { abierto: false, texto: "Sin atención" };
}

/** Filas del horario para mostrar: [días, horas] */
export const filasHorario = () =>
  CONFIG.horario.map(t => [t.etiqueta, t.abre && t.cierra ? `${hora(t.abre)} – ${hora(t.cierra)}` : "Cerrado"] as const);

/** Próximo festivo desde hoy (para avisarlo en el horario), dentro de los próximos `dias` */
export function proximoFestivo(ahora = new Date(), dias = 10): { nombre: string; fecha: Date } | null {
  for (let i = 0; i <= dias; i++) {
    const f = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i);
    const n = festivo(f);
    if (n && f.getDay() !== 0) return { nombre: n, fecha: f };
  }
  return null;
}
