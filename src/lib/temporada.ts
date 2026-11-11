/* Animación 52: detalles por temporada que se encienden y se apagan solos por fecha (hora de Bogotá). No cambian precios
   ni anuncian promociones: solo el color de las estrellas fugaces y, en diciembre, un gorrito en el cohete del logo.
     · Navidad y año nuevo (1 de diciembre a 6 de enero): gorrito y fugaces doradas y rojas
     · Fiestas patrias (20 de julio y 7 de agosto): fugaces amarillas, azules y rojas, como la bandera
     · Amor y amistad (septiembre): fugaces rosadas
     · Halloween (24 al 31 de octubre): fugaces naranjas y moradas */

export type Temporada = { id: string; fugaces: string[]; gorro: boolean };

const TEMPORADAS: Record<string, Temporada> = {
  navidad: { id: "navidad", fugaces: ["#FFD36B", "#FFE9A8", "#FF6B6B"], gorro: true },
  patria: { id: "patria", fugaces: ["#FFD23F", "#4D7CFE", "#FF5A5A"], gorro: false },
  amistad: { id: "amistad", fugaces: ["#FF9EC4", "#FFC2D9", "#FFFFFF"], gorro: false },
  halloween: { id: "halloween", fugaces: ["#FF8A3D", "#B48CFF", "#FFFFFF"], gorro: false }
};

function deFecha(fecha: Date): Temporada | null {
  const [mes, dia] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", month: "numeric", day: "numeric" })
    .formatToParts(fecha).filter(p => p.type === "month" || p.type === "day").map(p => Number(p.value));
  if (mes === 12 || (mes === 1 && (dia ?? 0) <= 6)) return TEMPORADAS.navidad ?? null;
  if ((mes === 7 && dia === 20) || (mes === 8 && dia === 7)) return TEMPORADAS.patria ?? null;
  if (mes === 9) return TEMPORADAS.amistad ?? null;
  if (mes === 10 && (dia ?? 0) >= 24) return TEMPORADAS.halloween ?? null;
  return null;
}

/** Vista previa con un enlace: ?temporada=navidad (como del 1 al 24 de diciembre), ?temporada=findeano (del 25 al 31),
    o patria, amistad, halloween. Funciona también en la página publicada, pero solo para quien abre ese enlace: los demás
    visitantes ven la página según la fecha de hoy. No cambia precios ni anuncia promociones */
const PREVIA = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("temporada");

/** Temporada de hoy (o null), o la de la vista previa */
export function temporadaActual(fecha = new Date()): Temporada | null {
  if (PREVIA === "findeano") return TEMPORADAS.navidad ?? null;
  if (PREVIA && TEMPORADAS[PREVIA]) return TEMPORADAS[PREVIA] ?? null;
  return deFecha(fecha);
}

export const TEMPORADA = temporadaActual();

/** Temporada de regalos: del 1 al 31 de diciembre (hora de Bogotá) la portada muestra «Regalos por presupuesto» e «Ideas
    para regalar», y arriba de todas las páginas sale una franja que lleva a ellos. Hasta el 24 la franja habla de Navidad;
    del 25 al 31, de fin de año. Se enciende y se apaga sola, sin publicar nada. No anuncia descuentos ni promociones.
    Se ve antes de tiempo con ?temporada=navidad (1 al 24) o ?temporada=findeano (25 al 31) */
export type Regalos = { navidad: boolean };
export function regalosActuales(fecha = new Date()): Regalos | null {
  if (PREVIA === "navidad") return { navidad: true };
  if (PREVIA === "findeano") return { navidad: false };
  const [mes, dia] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", month: "numeric", day: "numeric" })
    .formatToParts(fecha).filter(p => p.type === "month" || p.type === "day").map(p => Number(p.value));
  if (mes !== 12) return null;
  return { navidad: (dia ?? 0) <= 24 };
}

export const REGALOS = regalosActuales();
