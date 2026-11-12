/* Listas de la sección «por presupuesto» (portada, todo el año desde el 12/11/2026) y de «Ideas para regalar» (diciembre).
   Todo sale del catálogo con sus precios de siempre: aquí solo se eligen y se ordenan productos, no se cambia ningún precio
   ni se inventa ninguna promoción. Quedan fuera los de «Preguntar disponibilidad» y los que no tienen foto.
   En cada temporada (lib/temporada.ts) la sección muestra solo los tipos de producto de esa fecha: en el Día de la Madre,
   regalos para mamá; en regreso a clases, lo de estudiar; sin temporada, de todo. */
import { MAS_VENDIDOS, PRODUCTOS, VITRINA, desde } from "../data/catalogo";
import type { Producto } from "../types";
import { REGALABLES, TEMPORADA } from "./temporada";

/** Rangos de precio (por el precio más bajo del producto). Cada uno empieza donde termina el anterior */
export const RANGOS = [
  { id: "200", texto: "Hasta $200.000", min: 0, max: 200_000 },
  { id: "500", texto: "$200.000 a $500.000", min: 200_000, max: 500_000 },
  { id: "1000", texto: "$500.000 a $1.000.000", min: 500_000, max: 1_000_000 },
  { id: "mas", texto: "Más de $1.000.000", min: 1_000_000, max: Infinity }
] as const;

const de = (tipos: string[]) => (p: Producto) => tipos.includes(p.tienda) || tipos.includes(`${p.tienda}:${p.categoria ?? ""}`);

/** Productos que se pueden mostrar en estas filas */
const CON_FOTO = PRODUCTOS.filter(p => !p.consultar && p.imagen);
const tiposTemporada = TEMPORADA?.presupuesto.tipos;
const DEL_PRESUPUESTO = tiposTemporada ? CON_FOTO.filter(de(tiposTemporada)) : CON_FOTO;
const REGALOS_TODOS = CON_FOTO.filter(de(REGALABLES));

/** Puntos para ordenar: primero lo más vendido y la vitrina de la portada, después los destacados */
const PUNTOS: Record<string, number> = {};
MAS_VENDIDOS.forEach((id, k) => { PUNTOS[id] = 300 - k; });
VITRINA.forEach((id, k) => { PUNTOS[id] = Math.max(PUNTOS[id] ?? 0, 200 - k); });

/** Cuántos productos lleva cada fila */
const TOPE = 16;

/** Arma una fila variada: va tomando uno de cada sección por turnos (celular, audífonos, reloj, celular…) para que no queden
    16 celulares seguidos. Dentro de cada sección: primero lo más vendido, luego del más caro al más barato del rango
    (el más completo que alcanza para ese presupuesto) */
function variada(lista: Producto[]): Producto[] {
  const porSeccion = new Map<string, Producto[]>();
  const orden = [...lista].sort((a, b) => (PUNTOS[b.id] ?? 0) - (PUNTOS[a.id] ?? 0) || Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)) || desde(b) - desde(a));
  for (const p of orden) {
    const clave = `${p.tienda}:${p.categoria ?? ""}`;
    porSeccion.set(clave, [...(porSeccion.get(clave) ?? []), p]);
  }
  const grupos = [...porSeccion.values()].sort((a, b) => (PUNTOS[b[0]?.id ?? ""] ?? 0) - (PUNTOS[a[0]?.id ?? ""] ?? 0) || b.length - a.length);
  const fila: Producto[] = [];
  while (fila.length < TOPE && grupos.some(g => g.length)) {
    for (const g of grupos) {
      const p = g.shift();
      if (p && fila.length < TOPE) fila.push(p);
    }
  }
  return fila;
}

export const porRango = (id: string): Producto[] => {
  const r = RANGOS.find(x => x.id === id) ?? RANGOS[0];
  return variada(DEL_PRESUPUESTO.filter(p => desde(p) >= r.min && desde(p) < r.max));
};

/** Ideas por persona: cada una con los tipos de producto que le sirven, su color (los de las tarjetas de categoría) y un
    producto recortado (public/fotos/recortes) */
export const PERSONAS: { id: string; titulo: string; frase: string; tema: "oscuro" | "acento" | "marca" | "menta"; foto: string; tipos: string[] }[] = [
  { id: "gamer", titulo: "Para el gamer", frase: "Consolas, controles, diademas y más", tema: "oscuro", foto: "p31161",
    tipos: ["con", "pc:portatiles-gamer", "pc:escritorio-gamer", "per:diademas", "per:mouse", "per:teclados", "per:sillas", "comp:video"] },
  { id: "trabajo", titulo: "Para trabajar", frase: "Portátiles, monitores y lo del escritorio", tema: "acento", foto: "p52351",
    tipos: ["pc:portatiles", "per:monitores", "per:combos", "per:camaras-web", "per:streaming", "aud:audio"] },
  { id: "estudio", titulo: "Para estudiar", frase: "Tablets, portátiles y audífonos", tema: "marca", foto: "mbairm5",
    tipos: ["tab", "pc:portatiles", "aud", "acc:powerbank", "acc:lapices", "per:memorias"] },
  { id: "casa", titulo: "Para la casa", frase: "Televisores, parlantes y relojes", tema: "menta", foto: "tvs43u",
    tipos: ["tv", "par", "rel", "mov"] }
];

export const porPersona = (id: string): Producto[] => {
  const persona = PERSONAS.find(x => x.id === id) ?? PERSONAS[0];
  return persona ? variada(REGALOS_TODOS.filter(de(persona.tipos))) : [];
};
