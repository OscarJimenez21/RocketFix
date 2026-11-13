/* Ideas 4, 6, 7, 8, 13 y 29 (12/11/2026): filtros que salen de los datos que ya tiene cada producto.
   No se inventa nada: si un dato no está escrito en el nombre, las características o las versiones, el producto
   simplemente no aparece al filtrar por él (por eso cada filtro solo se muestra cuando hay al menos dos valores). */
import type { Producto } from "../types";
import { norm } from "./formato";

/** Capacidad de almacenamiento de cada versión («256 GB», «1 TB»). Celulares y tabletas */
export function capacidades(p: Producto): string[] {
  const out = new Set<string>();
  for (const o of p.opciones) {
    const m = /(?:^|·\s*)(\d+)\s*(GB|TB)(?!\s*RAM)\b/i.exec(o.nombre);
    if (m) out.add(`${m[1]} ${m[2]?.toUpperCase()}`);
  }
  if (!out.size) {
    for (const s of p.specs) {
      const m = /^(\d+)\s*(GB|TB)$/i.exec(s.trim());
      if (m) out.add(`${m[1]} ${m[2]?.toUpperCase()}`);
    }
  }
  return [...out];
}

/** Memoria RAM (en GB) de un computador: la característica corta tipo «16GB DDR5» (no la del disco ni la del video) */
export function ramDe(p: Producto): number | null {
  for (const s of p.specs) {
    if (/ssd|hdd|nvme|rtx|gtx|radeon|rx\s?\d|arc/i.test(s)) continue;
    const m = /^(\d{1,2})\s*GB\b/i.exec(s.trim());
    if (m) return Number(m[1]);
  }
  return null;
}

/** Familia del procesador (Core i5, Core Ultra 7, Ryzen 5, Apple M4…) a partir del nombre y las características */
export function procesadorDe(p: Producto): string | null {
  const t = `${p.nombre} ${p.specs.join(" ")}`;
  const m = /\b(Core\s+Ultra\s+\d|Core\s+i\d|Core\s+\d|Ryzen\s+(?:AI\s+)?\d|Celeron|Pentium|Athlon|Snapdragon\s+X\w*|Apple\s+M\d|M\d\s+(?:Pro|Max)?)\b/i.exec(t);
  if (!m?.[1]) return null;
  return m[1].replace(/\s+/g, " ").replace(/^core/i, "Core").replace(/^ryzen/i, "Ryzen").replace(/ultra/i, "Ultra").replace(/^m(\d)/i, "Apple M$1").trim();
}

/** Tamaño de pantalla en pulgadas (32", 15,6") según las características o el nombre */
export function pulgadasDe(p: Producto): number | null {
  for (const t of [...p.specs, p.nombre]) {
    const m = /(\d{1,3}(?:[.,]\d)?)\s*(?:"|″|''|pulgadas)/i.exec(t);
    if (m?.[1]) {
      const n = Number(m[1].replace(",", "."));
      if (n >= 5 && n <= 100) return n;
    }
  }
  return null;
}

/** Rango de pantalla para filtrar (agrupa 15,6" con 15", etc.) */
export const rangoPulgadas = (n: number) => (n < 13 ? "Menos de 13″" : n < 15 ? "13″ a 14″" : n < 17 ? "15″ a 16″" : n < 25 ? "17″ a 24″" : n < 33 ? "25″ a 32″" : n < 50 ? "33″ a 49″" : "50″ o más");
const ORDEN_PULGADAS = ["Menos de 13″", "13″ a 14″", "15″ a 16″", "17″ a 24″", "25″ a 32″", "33″ a 49″", "50″ o más"];
export const ordenPulgadas = (a: string, b: string) => ORDEN_PULGADAS.indexOf(a) - ORDEN_PULGADAS.indexOf(b);

/** Idea 29: el producto dice que tiene 5G (en el nombre, las características o alguna versión) */
export const tiene5G = (p: Producto) => /\b5g\b/.test(norm(`${p.nombre} ${p.specs.join(" ")} ${p.opciones.map(o => o.nombre).join(" ")}`));

/** Ordena capacidades de menor a mayor (64 GB, 128 GB, 1 TB) */
export const enGB = (c: string) => { const [n = "0", u = "GB"] = c.split(" "); return Number(n) * (u === "TB" ? 1024 : 1); };

/* ---------- Idea 13: filtros en la dirección ----------
   /RocketFix/celulares/?marca=Apple&capacidad=256+GB&orden=menor. Se puede compartir o guardar la búsqueda tal cual.
   Solo se escriben los que no están en su valor de siempre. */
export interface FiltrosUrl { cat: string; marca: string; cond: string; q: string; orden: string; tope: number | null; capacidad: string; ram: string; cpu: string; pantalla: string; red: string }
export const FILTROS_VACIOS: FiltrosUrl = { cat: "todos", marca: "todas", cond: "todos", q: "", orden: "rel", tope: null, capacidad: "", ram: "", cpu: "", pantalla: "", red: "" };
const ORDENES = ["rel", "menor", "mayor", "nuevos"];

export function filtrosDeUrl(busqueda: string): Partial<FiltrosUrl> {
  const q = new URLSearchParams(busqueda);
  const r: Partial<FiltrosUrl> = {};
  const texto = (k: string, max = 60) => (q.get(k) ?? "").slice(0, max);
  if (q.has("tipo")) r.cat = texto("tipo");
  if (q.has("marca")) r.marca = texto("marca");
  if (q.has("estado")) r.cond = texto("estado");
  if (q.has("q")) r.q = texto("q", 80);
  const orden = q.get("orden");
  if (orden && ORDENES.includes(orden)) r.orden = orden;
  const tope = Number(q.get("hasta"));
  if (q.has("hasta") && Number.isFinite(tope) && tope > 0) r.tope = tope;
  for (const k of ["capacidad", "ram", "cpu", "pantalla", "red"] as const) if (q.has(k)) r[k] = texto(k);
  return r;
}

export function urlDeFiltros(f: FiltrosUrl): string {
  const q = new URLSearchParams();
  if (f.cat !== "todos") q.set("tipo", f.cat);
  if (f.marca !== "todas") q.set("marca", f.marca);
  if (f.cond !== "todos") q.set("estado", f.cond);
  if (f.q.trim()) q.set("q", f.q.trim());
  if (f.orden !== "rel") q.set("orden", f.orden);
  if (f.tope != null) q.set("hasta", String(f.tope));
  for (const k of ["capacidad", "ram", "cpu", "pantalla", "red"] as const) if (f[k]) q.set(k, f[k]);
  const s = q.toString();
  return s ? `?${s}` : "";
}
