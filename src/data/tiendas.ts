import type { TiendaId } from "../types";

/** Secciones de la tienda en el orden del menú, con el texto de su tarjeta en la portada (el de la tienda original) */
export interface InfoTienda {
  id: TiendaId;
  vista: string;
  /** Nombre corto para el menú */
  menu: string;
  titulo: string;
  texto: string;
  /** Producto cuya foto representa la sección en la portada */
  foto: string;
  /** Texto del buscador de la sección */
  ejemploBusqueda: string;
}

export const TIENDAS: InfoTienda[] = [
  { id: "cel", vista: "celulares", menu: "Celulares", titulo: "Celulares", texto: "iPhone, Samsung, Xiaomi, Motorola, Honor y más. Eliges capacidad y versión.", foto: "ip17pm", ejemploBusqueda: "iPhone 17, S25 Ultra, 5G…" },
  { id: "pc", vista: "computadores", menu: "Computadores", titulo: "Computadores", texto: "Portátiles, PC de oficina y PC gamer listos para usar. También MacBook.", foto: "mbairm5", ejemploBusqueda: "Ryzen 7, RTX 5060, MacBook…" },
  { id: "comp", vista: "componentes", menu: "Componentes", titulo: "Componentes", texto: "Procesadores, RAM, SSD, tarjetas de video, tarjetas madre y fuentes.", foto: "p3751", ejemploBusqueda: "RTX 5060, DDR5, Ryzen…" },
  { id: "per", vista: "perifericos", menu: "Periféricos", titulo: "Periféricos y gaming", texto: "Monitores, teclados, mouse, diademas, sillas gamer, redes y cables.", foto: "p15412", ejemploBusqueda: "Monitor 27, teclado, Logitech…" },
  { id: "con", vista: "consolas", menu: "Consolas", titulo: "Consolas", texto: "PlayStation 5, Nintendo Switch 2, ROG Xbox Ally, controles, realidad virtual y timones.", foto: "p45631", ejemploBusqueda: "PS5, Switch 2, control…" },
  { id: "tab", vista: "tablets", menu: "Tablets", titulo: "Tablets", texto: "iPad, Samsung Galaxy Tab, Redmi Pad y Tecno.", foto: "ipad11", ejemploBusqueda: "iPad, Galaxy Tab…" },
  { id: "rel", vista: "relojes", menu: "Relojes", titulo: "Relojes", texto: "Apple Watch, Galaxy Watch, Huawei y Xiaomi. Relojes y manillas inteligentes.", foto: "aws11", ejemploBusqueda: "Apple Watch, Band…" },
  { id: "aud", vista: "audifonos", menu: "Audífonos", titulo: "Audífonos", texto: "AirPods, Galaxy Buds, Redmi Buds, Huawei FreeBuds y audífonos con cable.", foto: "appro3", ejemploBusqueda: "AirPods, Buds…" },
  { id: "par", vista: "parlantes", menu: "Parlantes", titulo: "Parlantes", texto: "JBL Boombox, Charge y Flip, parlantes Xiaomi y parlantes para computador.", foto: "jblflip7", ejemploBusqueda: "JBL, Xiaomi…" },
  { id: "tv", vista: "televisores", menu: "TV y hogar", titulo: "TV y hogar", texto: "Smart TV Samsung, Xiaomi, Fly y Corn, y aspiradoras.", foto: "tvs43u", ejemploBusqueda: "Samsung 43, Smart TV…" },
  { id: "acc", vista: "accesorios", menu: "Accesorios", titulo: "Accesorios", texto: "Cargadores originales, cables, power banks, Apple Pencil y teclados para iPad.", foto: "p45648", ejemploBusqueda: "Cargador, cable USB-C…" },
  { id: "mov", vista: "patinetas", menu: "Patinetas", titulo: "Patinetas", texto: "Patinetas eléctricas Xiaomi para moverte por la ciudad.", foto: "xpatineta", ejemploBusqueda: "Xiaomi…" }
];

export const tiendaPorVista = (vista: string) => TIENDAS.find(t => t.vista === vista);
export const tiendaPorId = (id: TiendaId) => TIENDAS.find(t => t.id === id);

/** Secciones con más ventas y más productos: van a la vista en el menú y en la portada */
export const PRINCIPALES: TiendaId[] = ["cel", "pc", "comp", "per", "con", "acc"];

/** Grupos del menú "Todas las categorías" (cada sección aparece en un solo grupo) */
export const GRUPOS: { titulo: string; tiendas: TiendaId[] }[] = [
  { titulo: "Celulares y tablets", tiendas: ["cel", "tab", "rel"] },
  { titulo: "Computación", tiendas: ["pc", "comp", "per"] },
  { titulo: "Gaming y entretenimiento", tiendas: ["con", "tv", "aud", "par"] },
  { titulo: "Accesorios y movilidad", tiendas: ["acc", "mov"] }
];
