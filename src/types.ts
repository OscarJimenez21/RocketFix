/** Código de cada sección de la tienda (igual que en la tienda original) */
export type TiendaId = "pc" | "comp" | "per" | "con" | "tv" | "cel" | "tab" | "rel" | "aud" | "par" | "acc" | "mov";

/** Estado del equipo. La tienda original usa estos valores; un producto sin estado es "Nuevo". */
export type EstadoProducto = "Nuevo" | "CPO" | "Usado" | "Open box";

export interface Opcion {
  /** Nombre de la versión (ej.: "256 GB"). Vacío cuando el producto tiene un solo precio. */
  nombre: string;
  /** Precio de venta en pesos colombianos, sin decimales */
  precio: number;
}

export interface Producto {
  id: string;
  tienda: TiendaId;
  /** Tipo de producto dentro de la sección (los celulares no lo tienen) */
  categoria?: string;
  marca?: string;
  nombre: string;
  specs: string[];
  opciones: Opcion[];
  estado: EstadoProducto | string;
  /** Ruta de la foto principal dentro de public/ (ej.: "fotos/sa07.jpg") */
  imagen?: string;
  /** Dibujo para cuando no hay foto */
  ilustracion?: string;
  /** Texto destacado, ej.: "Obsequio: audífonos" */
  nota?: string;
  /** Nombre del selector de versiones (ej.: "Color"); por defecto "Versión" */
  etiqueta?: string;
  destacado?: boolean;
  garantia?: string;
  stock?: number;
  ejemplo?: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Descripcion {
  /** Texto del proveedor o escrito para la tienda */
  resumen?: string;
  /** Ficha técnica: pares [característica, valor] */
  ficha?: [string, string][];
}

export interface Envio {
  costo: number;
  gratisDesde: number;
}

export type ZonaEntrega = "bogota" | "nacional";

export interface Turno {
  etiqueta: string;
  dias: number[];
  abre: string | null;
  cierra: string | null;
}

export interface Config {
  ejemplo: boolean;
  nombre: string;
  whatsapp: string;
  whatsappVisible: string;
  atencion: string;
  moneda: string;
  idioma: string;
  pagos: Record<ZonaEntrega, string[]>;
  domicilio: string;
  envio: string;
  envios: Record<ZonaEntrega, Envio>;
  /** Bold: la "llave de identidad" es pública. firmaUrl es el servicio que firma el total (opcional). */
  bold: { llave: string; firmaUrl: string };
  redes: { instagram: string; facebook: string; tiktok: string };
  horario: Turno[];
}

export interface Articulo {
  id: string;
  etiqueta: string;
  titulo: string;
  resumen: string;
  ilustracion: string;
  minutos: number;
  tono: string;
}

export interface Servicio {
  id: string;
  titulo: string;
  ilustracion: string;
  articulo: string;
  tono: string;
  texto: string;
  trabajos: string[];
  equipo?: string;
  detalle: string;
  camaras?: boolean;
}

export interface Paquete {
  nombre: string;
  ilustracion: string;
  specs: string[];
  desde: number;
}

export interface NotaCabecera {
  titulo: string;
  texto: string;
  enlace: string;
  /** Enlace interno (vista) o null */
  href: string | null;
  /** Mensaje de WhatsApp ("" = chat sin mensaje; null = no es de WhatsApp) */
  whatsapp: string | null;
}

export interface Cabecera {
  titulo: string;
  lead: string;
  nota: NotaCabecera | null;
}

export interface FormaPago {
  nombre: string;
  archivo: string | null;
  icono: string | null;
  alt: string | null;
}

/** Una línea del carrito: un producto en una versión */
export interface LineaCarrito {
  producto: Producto;
  opcion: Opcion;
  indice: number;
  clave: string;
  cantidad: number;
}

/** Rutas de la aplicación (se escriben después de #, igual que en la tienda original) */
export type Ruta =
  | { tipo: "inicio"; ancla?: string }
  | { tipo: "tienda"; vista: string; tienda: TiendaId }
  | { tipo: "producto"; id: string }
  | { tipo: "buscar"; q: string }
  | { tipo: "marca"; marca: string }
  | { tipo: "blog" }
  | { tipo: "articulo"; id: string }
  | { tipo: "no-encontrada"; hash: string };
