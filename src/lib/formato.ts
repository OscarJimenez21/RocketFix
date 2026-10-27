const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const listaY = new Intl.ListFormat("es", { type: "conjunction" });

/** $ 1.250.000 */
export const dinero = (n: number) => pesos.format(n);
/** "a, b y c" */
export const lista = (items: string[]) => listaY.format(items);
/** Minúsculas y sin tildes, para comparar textos */
export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Ruta de un archivo de public/ respetando la base de publicación (ej.: /RocketFix/fotos/sa07.jpg) */
export const recurso = (ruta: string) => (/^(https?:|data:|\/)/.test(ruta) ? ruta : `${import.meta.env.BASE_URL}${ruta}`);
