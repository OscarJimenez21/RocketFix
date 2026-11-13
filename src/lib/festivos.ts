/* Idea 100 (12/11/2026): festivos de Colombia, para que «Abierto ahora» no diga abierto un lunes festivo.
   Se calculan solos para cualquier año (no hay que actualizarlos):
     · Fijos: 1 de enero, 1 de mayo, 20 de julio, 7 de agosto, 8 y 25 de diciembre.
     · Ley Emiliani (Ley 51 de 1983): pasan al lunes siguiente si no caen en lunes: 6 de enero, 19 de marzo, 29 de junio,
       15 de agosto, 12 de octubre, 1 de noviembre y 11 de noviembre.
     · Según la Pascua: Jueves y Viernes Santo, y (pasados a lunes) Ascensión, Corpus Christi y Sagrado Corazón. */

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher, calendario gregoriano) */
export function pascua(anio: number): Date {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

const clave = (f: Date) => `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
const masDias = (f: Date, n: number) => new Date(f.getFullYear(), f.getMonth(), f.getDate() + n);
/** El mismo día si es lunes; si no, el lunes siguiente */
const aLunes = (f: Date) => masDias(f, (8 - f.getDay()) % 7);

const cache = new Map<number, Map<string, string>>();

/** Festivos de un año: fecha AAAA-MM-DD → nombre */
export function festivosDe(anio: number): Map<string, string> {
  const listo = cache.get(anio);
  if (listo) return listo;
  const f = (mes: number, dia: number) => new Date(anio, mes - 1, dia);
  const p = pascua(anio);
  const lista: [Date, string][] = [
    [f(1, 1), "Año Nuevo"],
    [aLunes(f(1, 6)), "Día de los Reyes Magos"],
    [aLunes(f(3, 19)), "Día de San José"],
    [masDias(p, -3), "Jueves Santo"],
    [masDias(p, -2), "Viernes Santo"],
    [f(5, 1), "Día del Trabajo"],
    [masDias(p, 43), "Ascensión del Señor"],
    [masDias(p, 64), "Corpus Christi"],
    [masDias(p, 71), "Sagrado Corazón"],
    [aLunes(f(6, 29)), "San Pedro y San Pablo"],
    [f(7, 20), "Día de la Independencia"],
    [f(8, 7), "Batalla de Boyacá"],
    [aLunes(f(8, 15)), "Asunción de la Virgen"],
    [aLunes(f(10, 12)), "Día de la Diversidad Étnica y Cultural"],
    [aLunes(f(11, 1)), "Día de Todos los Santos"],
    [aLunes(f(11, 11)), "Independencia de Cartagena"],
    [f(12, 8), "Inmaculada Concepción"],
    [f(12, 25), "Navidad"]
  ];
  const m = new Map(lista.map(([fecha, nombre]) => [clave(fecha), nombre]));
  cache.set(anio, m);
  return m;
}

/** Nombre del festivo de esa fecha (hora del equipo), o null si es un día normal */
export const festivo = (fecha: Date): string | null => festivosDe(fecha.getFullYear()).get(clave(fecha)) ?? null;
