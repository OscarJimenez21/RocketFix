/* Temporadas (animación 52, ampliada el 12/11/2026). Se encienden y se apagan solas por fecha (hora de Bogotá), sin
   publicar nada. Cambian la decoración (logo, portada, franja de arriba, pie de página, color de las estrellas fugaces)
   y los textos de la sección «por presupuesto» de la portada. No cambian precios ni anuncian descuentos o promociones.

     · Navidad ........... 1 al 24 de diciembre: gorrito, nieve, guirnalda de luces, esferas
     · Fin de año ........ 25 de diciembre al 6 de enero: fuegos artificiales, confeti y guirnalda dorada
     · Regreso a clases .. 7 de enero al 15 de febrero: lápices, reglas y cuadernos
     · Día del Niño ...... del 15 de abril al último sábado de abril: globos y confeti
     · Día de la Madre ... del 1 de mayo al segundo domingo de mayo: flores y pétalos
     · Día del Padre ..... del 1 de junio al tercer domingo de junio: corbatín y banderines
     · Fiestas patrias ... 20 de julio y 7 de agosto: bandera de Colombia ondeando y banderines tricolor
     · Amor y amistad .... septiembre: corazones que flotan
     · Halloween ......... 24 al 31 de octubre: calabazas, murciélagos y telarañas

   Vista previa con un enlace: ?temporada=<id> (navidad, findeano, clases, nino, madre, padre, patria, amistad, halloween).
   Funciona también en la página publicada, pero solo para quien abre ese enlace: los demás ven la de la fecha de hoy. */

export type IdTemporada = "navidad" | "findeano" | "clases" | "nino" | "madre" | "padre" | "patria" | "amistad" | "halloween";

export type Temporada = {
  id: IdTemporada;
  /** Colores de las estrellas fugaces de la portada */
  fugaces: string[];
  /** Colores de la franja de arriba y de la sección por presupuesto */
  fondo: string;
  acento: string;
  /** Franja de arriba de todas las páginas. Si lleva `ver`, es un enlace a la sección por presupuesto */
  franja: { texto: string; mas?: string; ver?: string };
  /** Sección «por presupuesto» de la portada. `tipos`: los productos que se muestran (sección o sección:tipo) */
  presupuesto: { etiqueta: string; titulo: string; texto: string; tipos?: string[] };
  /** «Ideas para regalar» (por persona) en la portada */
  ideas?: boolean;
};

const TEXTO_REGALO = "Elige cuánto quieres gastar y te mostramos ideas en ese rango, con el precio de siempre.";

/** Tipos de producto que se regalan (sin repuestos ni cables: una fuente de poder o un cable no son un regalo) */
export const REGALABLES = [
  "cel", "tab", "rel", "aud", "par", "con", "tv", "mov",
  "pc:portatiles", "pc:portatiles-gamer", "pc:escritorio-gamer",
  "per:monitores", "per:teclados", "per:mouse", "per:diademas", "per:combos", "per:sillas", "per:camaras-web", "per:streaming", "per:memorias",
  "acc:powerbank", "acc:lapices",
  "comp:video"
];

const TEMPORADAS: Record<IdTemporada, Temporada> = {
  navidad: {
    id: "navidad", fugaces: ["#FFD36B", "#FFE9A8", "#FF6B6B"], fondo: "#0E3B2C", acento: "#FFD36B", ideas: true,
    franja: { texto: "Regalos de Navidad", mas: ": ideas por presupuesto y por persona", ver: "Ver regalos" },
    presupuesto: { etiqueta: "Regalos de Navidad", titulo: "Regalos para cada presupuesto", texto: TEXTO_REGALO, tipos: REGALABLES }
  },
  findeano: {
    id: "findeano", fugaces: ["#FFD36B", "#FFFFFF", "#7FE3FF"], fondo: "#0B1A33", acento: "#FFD36B", ideas: true,
    franja: { texto: "Regalos de fin de año", mas: ": ideas por presupuesto y por persona", ver: "Ver regalos" },
    presupuesto: { etiqueta: "Regalos de fin de año", titulo: "Regalos para cada presupuesto", texto: TEXTO_REGALO, tipos: REGALABLES }
  },
  clases: {
    id: "clases", fugaces: ["#FFD23F", "#7FC8FF", "#FFFFFF"], fondo: "#123B5C", acento: "#FFD23F",
    franja: { texto: "Regreso a clases", mas: ": portátiles, tablets y más por presupuesto", ver: "Ver opciones" },
    presupuesto: {
      etiqueta: "Regreso a clases", titulo: "Todo para estudiar, por presupuesto", texto: "Portátiles, tablets, audífonos y lo del escritorio, con el precio de siempre.",
      tipos: ["pc:portatiles", "tab", "acc:lapices", "aud", "acc:powerbank", "per:mouse", "per:teclados", "per:combos", "per:memorias", "per:camaras-web", "per:monitores"]
    }
  },
  nino: {
    id: "nino", fugaces: ["#FFD23F", "#FF6B9A", "#5BC8FF"], fondo: "#2B2D8C", acento: "#FFD23F",
    franja: { texto: "Día del Niño", mas: ": regalos por presupuesto", ver: "Ver regalos" },
    presupuesto: { etiqueta: "Día del Niño", titulo: "Regalos para los niños", texto: TEXTO_REGALO, tipos: ["tab", "con", "aud", "rel", "par", "per:diademas", "per:mouse", "acc:lapices"] }
  },
  madre: {
    id: "madre", fugaces: ["#FFB3D1", "#FFE1EC", "#FFFFFF"], fondo: "#5A1F4A", acento: "#FFB3D1",
    franja: { texto: "Día de la Madre", mas: ": regalos para mamá por presupuesto", ver: "Ver regalos" },
    presupuesto: { etiqueta: "Día de la Madre", titulo: "Regalos para mamá", texto: TEXTO_REGALO, tipos: ["cel", "tab", "rel", "aud", "par", "tv", "mov", "pc:portatiles"] }
  },
  padre: {
    id: "padre", fugaces: ["#7FC8FF", "#FFFFFF", "#FFD36B"], fondo: "#13305A", acento: "#7FC8FF",
    franja: { texto: "Día del Padre", mas: ": regalos para papá por presupuesto", ver: "Ver regalos" },
    presupuesto: {
      etiqueta: "Día del Padre", titulo: "Regalos para papá", texto: TEXTO_REGALO,
      tipos: ["cel", "rel", "aud", "par", "tv", "con", "pc:portatiles", "per:monitores", "per:sillas", "per:teclados", "per:mouse"]
    }
  },
  patria: {
    id: "patria", fugaces: ["#FFD23F", "#4D7CFE", "#FF5A5A"], fondo: "#0B2F7A", acento: "#FCD116",
    franja: { texto: "¡Feliz día, Colombia!", mas: " Celebramos con orgullo nuestra independencia" },
    presupuesto: { etiqueta: "Por presupuesto", titulo: "Elige por presupuesto", texto: "Dinos cuánto quieres gastar y te mostramos opciones en ese rango, con el precio de siempre." }
  },
  amistad: {
    id: "amistad", fugaces: ["#FF9EC4", "#FFC2D9", "#FFFFFF"], fondo: "#6E1740", acento: "#FF9EC4",
    franja: { texto: "Amor y amistad", mas: ": un detalle para cada presupuesto", ver: "Ver ideas" },
    presupuesto: { etiqueta: "Amor y amistad", titulo: "Un detalle para cada presupuesto", texto: TEXTO_REGALO, tipos: REGALABLES }
  },
  halloween: {
    id: "halloween", fugaces: ["#FF8A3D", "#B48CFF", "#FFFFFF"], fondo: "#1F1033", acento: "#FF8A3D",
    franja: { texto: "¡Feliz Halloween!", mas: " Dulce o truco… o un buen equipo nuevo" },
    presupuesto: { etiqueta: "Por presupuesto", titulo: "Elige por presupuesto", texto: "Dinos cuánto quieres gastar y te mostramos opciones en ese rango, con el precio de siempre." }
  }
};

/** Sección «por presupuesto» cuando no hay temporada (mejora 9: está todo el año) */
export const PRESUPUESTO_NORMAL: Temporada["presupuesto"] = {
  etiqueta: "Por presupuesto", titulo: "Elige por presupuesto",
  texto: "Dinos cuánto quieres gastar y te mostramos opciones en ese rango, con el precio de siempre."
};

/** Día de la semana (0 = domingo) de una fecha */
const diaSemana = (anio: number, mes: number, dia: number) => new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
/** El n-ésimo domingo de un mes (ej.: segundo domingo de mayo) */
const domingo = (anio: number, mes: number, n: number) => 1 + ((7 - diaSemana(anio, mes, 1)) % 7) + (n - 1) * 7;
/** Último sábado de abril (Día del Niño en Colombia) */
const ultimoSabadoAbril = (anio: number) => 30 - ((diaSemana(anio, 4, 30) + 1) % 7);

function hoyEnBogota(fecha: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(fecha);
  const n = (t: string) => Number(partes.find(p => p.type === t)?.value ?? 0);
  return { anio: n("year"), mes: n("month"), dia: n("day") };
}

export function idDeFecha(fecha: Date): IdTemporada | null {
  const { anio, mes, dia } = hoyEnBogota(fecha);
  if (mes === 12) return dia <= 24 ? "navidad" : "findeano";
  if (mes === 1) return dia <= 6 ? "findeano" : "clases";
  if (mes === 2 && dia <= 15) return "clases";
  if (mes === 4 && dia >= 15 && dia <= ultimoSabadoAbril(anio)) return "nino";
  if (mes === 5 && dia <= domingo(anio, 5, 2)) return "madre";
  if (mes === 6 && dia <= domingo(anio, 6, 3)) return "padre";
  if ((mes === 7 && dia === 20) || (mes === 8 && dia === 7)) return "patria";
  if (mes === 9) return "amistad";
  if (mes === 10 && dia >= 24) return "halloween";
  return null;
}

const PREVIA = typeof location === "undefined" ? null : new URLSearchParams(location.search).get("temporada");

/** Temporada de hoy (o null), o la de la vista previa */
export function temporadaActual(fecha = new Date()): Temporada | null {
  if (PREVIA && PREVIA in TEMPORADAS) return TEMPORADAS[PREVIA as IdTemporada];
  const id = idDeFecha(fecha);
  if (!id) return null;
  const t = TEMPORADAS[id];
  // Del 1 al 6 de enero ya no se habla de regalos de fin de año, sino de año nuevo
  if (id === "findeano" && hoyEnBogota(fecha).mes === 1) {
    return { ...t, franja: { texto: "¡Feliz año nuevo!", mas: " Gracias por confiar en Rocket Fix" },
      presupuesto: { etiqueta: "Año nuevo", titulo: "Estrena tecnología este año", texto: PRESUPUESTO_NORMAL.texto, tipos: REGALABLES } };
  }
  // Fiestas patrias: el texto dice cuál de las dos es
  if (id === "patria") {
    const { mes } = hoyEnBogota(fecha);
    return { ...t, franja: { texto: mes === 7 ? "¡Feliz 20 de julio, Colombia!" : "¡Feliz 7 de agosto, Colombia!", mas: t.franja.mas } };
  }
  return t;
}

export const TEMPORADA = temporadaActual();

/** Temporada de regalos de diciembre (compatibilidad con el código de antes): navidad del 1 al 24, fin de año del 25 al 31 */
export const REGALOS = TEMPORADA?.id === "navidad" ? { navidad: true } : TEMPORADA?.id === "findeano" ? { navidad: false } : null;
