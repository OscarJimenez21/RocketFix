import { describe, expect, it } from "vitest";
import { PRODUCTOS } from "../data/catalogo";
import type { LineaCarrito } from "../types";
import { dinero } from "./formato";
import { mensajePedido } from "./pedido";
import { leerPesos, revisarPedido } from "./verificarPedido";

const producto = PRODUCTOS.find(p => !p.consultar && p.opciones[0] && PRODUCTOS.filter(q => q.nombre === p.nombre).length === 1);
if (!producto) throw new Error("El catálogo no tiene productos con precio");
const opcion = producto.opciones[0];
if (!opcion) throw new Error("Sin versiones");
const lineas: LineaCarrito[] = [{ producto, opcion, indice: 0, clave: `${producto.id}~0`, cantidad: 2 }];
const datos = { nombre: "Laura", entrega: "bogota" as const, dir: "Calle 1", pago: "Nequi", nota: "" };
const original = mensajePedido(lineas, datos, undefined, "RF-ABCDE");

describe("verificar pedido (antifraude)", () => {
  it("lee valores en pesos", () => {
    expect(leerPesos("$ 1.250.000")).toBe(1250000);
    expect(leerPesos("$" + String.fromCharCode(160) + "15.000")).toBe(15000);
    expect(leerPesos("gratis")).toBe(0);
  });

  it("un pedido sin tocar coincide con la tienda", () => {
    const r = revisarPedido(original);
    expect(r.problemas).toEqual([]);
    expect(r.numero).toBe("RF-ABCDE");
    expect(r.lineas[0]?.estado).toBe("bien");
  });

  it("también funciona copiado de WhatsApp Web (fecha y nombre al inicio, espacios normales)", () => {
    const r = revisarPedido(`[14/11, 10:32 a. m.] Laura: ${original.replaceAll(String.fromCharCode(160), " ")}`);
    expect(r.problemas).toEqual([]);
  });

  it("detecta un precio editado a mano", () => {
    const real = dinero(opcion.precio * 2);
    const r = revisarPedido(original.replace(`: ${real}`, `: ${dinero(1000)}`));
    expect(r.lineas[0]?.estado).toBe("precio");
    expect(r.problemas.length).toBeGreaterThan(0);
  });

  it("detecta un total editado aunque las líneas estén bien", () => {
    const r = revisarPedido(original.replace(/Total: .+/, `Total: ${dinero(1000)}`));
    expect(r.problemas.some(p => p.startsWith("«Total»"))).toBe(true);
  });

  it("lee la referencia y el comprobante de un pago con Bold", () => {
    const conBold = mensajePedido(lineas, datos, "En línea con Bold · referencia RFABC12345", "RF-ABCDE").replace(/^(Pago: .*)$/m, "$1\nComprobante Bold: CNPVI70CQC0EY · Aprobado");
    const r = revisarPedido(conBold);
    expect(r).toMatchObject({ pagoBold: true, referencia: "RFABC12345", comprobante: "CNPVI70CQC0EY" });
    expect(r.problemas).toEqual([]);
  });

  it("avisa de productos que no existen en la tienda", () => {
    const r = revisarPedido(original.replace(producto.nombre, "Producto inventado XYZ"));
    expect(r.lineas[0]?.estado).toBe("desconocido");
  });
});
