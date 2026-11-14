/* Antifraude (14/11/2026): revisa un pedido que llegó por WhatsApp. El cliente puede editar el texto antes de enviarlo
   (cambiar un precio, la cantidad o el total), así que aquí se vuelve a calcular todo con los precios de la tienda.
   Solo lee el texto pegado: no guarda ni envía nada. Lo usa la página interna /verificar-pedido/. */
import { PRODUCTOS, nombreItem } from "../data/catalogo";
import type { Opcion, Producto, ZonaEntrega } from "../types";
import { dinero, norm } from "./formato";
import { envioDe } from "./pedido";

export type EstadoLinea = "bien" | "precio" | "desconocido" | "consultar";

export interface LineaRevisada {
  cantidad: number;
  nombre: string;
  /** Valor que trae el mensaje para esa línea (precio × cantidad) */
  escrito: number;
  /** Valor con el precio de hoy en la tienda */
  esperado?: number;
  producto?: Producto;
  opcion?: Opcion;
  estado: EstadoLinea;
}

export interface Revision {
  numero?: string;
  lineas: LineaRevisada[];
  zona?: ZonaEntrega;
  escrito: { productos?: number; envio?: number; total?: number };
  esperado: { productos: number; envio: number; total: number };
  /** Diferencias encontradas, en frases listas para leer. Vacío = el pedido coincide con la tienda */
  problemas: string[];
  pagoBold: boolean;
  /** Referencia del pago en Bold (RF…) y número de comprobante que trae el mensaje, si los trae */
  referencia?: string;
  comprobante?: string;
}

const clave = (s: string) => norm(s).replace(/\s+/g, " ").trim();

let indice: Map<string, { producto: Producto; opcion: Opcion }[]> | null = null;
function buscar(nombre: string) {
  if (!indice) {
    indice = new Map();
    for (const producto of PRODUCTOS) for (const opcion of producto.opciones) {
      const k = clave(nombreItem(producto, opcion.nombre));
      indice.set(k, [...(indice.get(k) ?? []), { producto, opcion }]);
    }
  }
  return indice.get(clave(nombre)) ?? [];
}

/** «$ 1.250.000» → 1250000; «gratis» → 0 */
export function leerPesos(s: string): number | undefined {
  if (/gratis/i.test(s)) return 0;
  const d = s.replace(/[^\d]/g, "");
  return d ? Number(d) : undefined;
}

// Marcas invisibles de dirección del texto que a veces mete WhatsApp al copiar (U+200E y U+200F)
const INVISIBLES = new RegExp(`[${String.fromCharCode(0x200e, 0x200f)}]`, "g");
const LINEA = /^[•*\-·]\s*(\d{1,4})\s*[×xX]\s*(.+):\s*(\$[\s\d.,]+)$/;
const CAMPO = (nombre: string) => new RegExp(`^${nombre}:\\s*(.+)$`, "i");

export function revisarPedido(texto: string): Revision {
  const lineas: LineaRevisada[] = [];
  const escrito: Revision["escrito"] = {};
  let zona: ZonaEntrega | undefined;
  let pagoBold = false;
  let numero: string | undefined;
  let referencia: string | undefined;
  let comprobante: string | undefined;

  for (const cruda of texto.split(/\r?\n/)) {
    // Al copiar de WhatsApp Web la primera línea trae «[fecha] Nombre: …»; el resto llega limpio
    const l = cruda.replace(INVISIBLES, "").trim();
    if (!l) continue;
    const n = /n\.º\s*(RF-[A-Z0-9]{5})/i.exec(l);
    if (n) numero = n[1]?.toUpperCase();
    const viñeta = l.indexOf("•");
    const m = LINEA.exec(viñeta > 0 ? l.slice(viñeta) : l);
    if (m) {
      const cantidad = Number(m[1]);
      const nombre = (m[2] ?? "").trim();
      const valor = leerPesos(m[3] ?? "") ?? 0;
      const opciones = buscar(nombre);
      // Si dos productos se llaman igual, sirve el que dé ese valor; si ninguno, se compara con el primero
      const elegido = opciones.find(o => o.opcion.precio * cantidad === valor) ?? opciones[0];
      if (!elegido) { lineas.push({ cantidad, nombre, escrito: valor, estado: "desconocido" }); continue; }
      const esperado = elegido.opcion.precio * cantidad;
      const estado: EstadoLinea = elegido.producto.consultar ? "consultar" : esperado === valor ? "bien" : "precio";
      lineas.push({ cantidad, nombre, escrito: valor, esperado, producto: elegido.producto, opcion: elegido.opcion, estado });
      continue;
    }
    const campo = (nombre: string) => CAMPO(nombre).exec(l)?.[1];
    const productos = campo("Productos"), envio = campo("Env[ií]o"), total = campo("Total"), entrega = campo("Entrega"), pago = campo("Pago");
    if (productos !== undefined) escrito.productos = leerPesos(productos);
    else if (envio !== undefined) escrito.envio = leerPesos(envio);
    else if (total !== undefined) escrito.total = leerPesos(total);
    else if (entrega !== undefined) zona = /bogot/i.test(entrega) ? "bogota" : /otra ciudad/i.test(entrega) ? "nacional" : undefined;
    else if (pago !== undefined) { pagoBold = /bold/i.test(pago); referencia = /referencia\s+(RF[0-9A-Z]{6,12})\b/.exec(pago)?.[1]; }
    else if (/^Comprobante Bold:/i.test(l)) comprobante = /^Comprobante Bold:\s*([A-Za-z0-9_-]{4,60})/i.exec(l)?.[1];
  }

  const conocidas = lineas.filter(l => l.esperado !== undefined);
  const subtotal = conocidas.reduce((s, l) => s + (l.esperado ?? 0), 0);
  const envio = envioDe(zona ?? "bogota", subtotal);
  const esperado = { productos: subtotal, envio, total: subtotal + envio };
  const problemas: string[] = [];

  if (!lineas.length) problemas.push("No encontré líneas de productos (las que empiezan con «•»). Pega el mensaje completo, tal como llegó.");
  for (const l of lineas) {
    if (l.estado === "desconocido") problemas.push(`«${l.nombre}» no coincide con ningún producto de la tienda: pudo cambiar de nombre o lo escribieron a mano. Revísalo antes de cobrar.`);
    if (l.estado === "precio") problemas.push(`«${l.nombre}» (${l.cantidad} ×): el mensaje dice ${dinero(l.escrito)} y en la tienda da ${dinero(l.esperado ?? 0)}.`);
    if (l.estado === "consultar") problemas.push(`«${l.nombre}» está marcado «Preguntar disponibilidad»: confirma precio y existencia antes de cobrar.`);
  }
  if (!zona) problemas.push("No encontré la línea «Entrega:»; calculé el envío como domicilio en Bogotá.");

  const sumaEscrita = lineas.reduce((s, l) => s + l.escrito, 0);
  if (escrito.productos !== undefined && lineas.length && escrito.productos !== sumaEscrita)
    problemas.push(`Las líneas suman ${dinero(sumaEscrita)}, pero «Productos» dice ${dinero(escrito.productos)}.`);
  if (escrito.productos !== undefined && conocidas.length === lineas.length && escrito.productos !== esperado.productos)
    problemas.push(`«Productos» dice ${dinero(escrito.productos)}; con los precios de la tienda da ${dinero(esperado.productos)}.`);
  if (escrito.envio === undefined) problemas.push("No encontré la línea «Envío:».");
  else if (conocidas.length === lineas.length && escrito.envio !== esperado.envio)
    problemas.push(`«Envío» dice ${escrito.envio ? dinero(escrito.envio) : "gratis"}; según la tienda es ${esperado.envio ? dinero(esperado.envio) : "gratis"}.`);
  if (escrito.total === undefined) problemas.push("No encontré la línea «Total:».");
  else {
    if (escrito.productos !== undefined && escrito.envio !== undefined && escrito.total !== escrito.productos + escrito.envio)
      problemas.push(`«Total» dice ${dinero(escrito.total)}, pero productos + envío del mismo mensaje dan ${dinero(escrito.productos + escrito.envio)}.`);
    if (conocidas.length === lineas.length && lineas.length && escrito.total !== esperado.total)
      problemas.push(`«Total» dice ${dinero(escrito.total)}; con los precios de la tienda el total es ${dinero(esperado.total)}.`);
  }

  return { numero, lineas, zona, escrito, esperado, problemas, pagoBold, referencia, comprobante };
}
