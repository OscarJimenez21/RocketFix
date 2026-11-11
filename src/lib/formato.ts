const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const listaY = new Intl.ListFormat("es", { type: "conjunction" });

/** $ 1.250.000 */
export const dinero = (n: number) => pesos.format(n);
/** "a, b y c" */
export const lista = (items: string[]) => listaY.format(items);
/** Minúsculas y sin tildes, para comparar textos */
export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
/** Texto para una dirección: "Cooler Master" → "cooler-master" (la misma regla de scripts/paginas-estaticas.mjs) */
export const slug = (s: string) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Ruta de un archivo de public/ respetando la base de publicación (ej.: /RocketFix/fotos/sa07.jpg) */
export const recurso = (ruta: string) => (/^(https?:|data:|\/)/.test(ruta) ? ruta : `${import.meta.env.BASE_URL}${ruta}`);

/** Anchos de las copias livianas de cada foto (las hace scripts/fotos-livianas.mjs con estos mismos anchos) */
export const ANCHOS_LIVIANOS = [300, 600] as const;
const FOTO_JPG = /^fotos\/((?:galeria\/)?[^/]+)\.jpg$/;

/** Lista de tamaños de una foto de producto para `srcSet`: las copias WebP de 300 y 600 px y la original de 800 px.
    El navegador baja solo la que necesita según `sizes`. Devuelve undefined si la foto no tiene copias livianas. */
export function srcsetFoto(ruta: string): string | undefined {
  const m = FOTO_JPG.exec(ruta);
  if (!m) return undefined;
  return [...ANCHOS_LIVIANOS.map(a => `${recurso(`fotos/liviana/${a}/${m[1]}.webp`)} ${a}w`), `${recurso(ruta)} 800w`].join(", ");
}
