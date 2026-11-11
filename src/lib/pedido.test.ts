import { describe, expect, it } from "vitest";
import { CONFIG, PRODUCTOS } from "../data/catalogo";
import type { LineaCarrito } from "../types";
import { dinero } from "./formato";
import { envioDe, leerDatosPedido, mensajePedido, subtotalDe } from "./pedido";

const producto = PRODUCTOS.find(p => !p.consultar);
if (!producto) throw new Error("El catálogo no tiene productos con precio");
const [opcion] = producto.opciones;
if (!opcion) throw new Error("El producto de prueba no tiene versiones");
const linea = (cantidad: number): LineaCarrito => ({ producto, opcion, indice: 0, clave: `${producto.id}~0`, cantidad });

describe("costo del envío", () => {
  for (const zona of ["bogota", "nacional"] as const) {
    const { costo, gratisDesde } = CONFIG.envios[zona];
    it(`${zona}: cobra un peso por debajo del tope`, () => expect(envioDe(zona, gratisDesde - 1)).toBe(costo));
    it(`${zona}: es gratis justo en el tope`, () => expect(envioDe(zona, gratisDesde)).toBe(0));
    it(`${zona}: es gratis por encima del tope`, () => expect(envioDe(zona, gratisDesde + 1)).toBe(0));
  }
});

describe("totales del pedido", () => {
  it("el subtotal es precio por cantidad, sumando las líneas", () => {
    expect(subtotalDe([])).toBe(0);
    expect(subtotalDe([linea(1)])).toBe(opcion.precio);
    expect(subtotalDe([linea(2), linea(3)])).toBe(opcion.precio * 5);
  });

  it("el mensaje de WhatsApp lleva productos, envío y el mismo total que ve el cliente", () => {
    const lineas = [linea(2)];
    const subtotal = subtotalDe(lineas);
    const envio = envioDe("nacional", subtotal);
    const mensaje = mensajePedido(lineas, { nombre: "Laura", entrega: "nacional", dir: "Medellín, calle 1", pago: "Daviplata", nota: "" });
    expect(mensaje).toContain(`2 × ${producto.nombre}`);
    expect(mensaje).toContain(`Productos: ${dinero(subtotal)}`);
    expect(mensaje).toContain(`Envío: ${envio ? dinero(envio) : "gratis"}`);
    expect(mensaje).toContain(`Total: ${dinero(subtotal + envio)}`);
    expect(mensaje).toContain("Nombre: Laura");
    expect(mensaje).toContain("Pago: Daviplata");
    expect(mensaje).not.toContain("Nota:");
  });

  it("con pago en línea, el mensaje dice la referencia en vez del medio de pago", () => {
    const mensaje = mensajePedido([linea(1)], { nombre: "A", entrega: "bogota", dir: "B", pago: "Efectivo", nota: "" }, "Pagado en línea con Bold · referencia RFABC123");
    expect(mensaje).toContain("Pago: Pagado en línea con Bold · referencia RFABC123");
    expect(mensaje).not.toContain("Pago: Efectivo");
  });
});

describe("datos del pedido guardados en el navegador", () => {
  const vacio = { nombre: "", entrega: "bogota", dir: "", pago: CONFIG.pagos.bogota[0], nota: "" };

  it("sin nada guardado, empieza vacío", () => expect(leerDatosPedido(null)).toEqual(vacio));
  it("con texto que no es JSON, empieza vacío", () => expect(leerDatosPedido("{dañado")).toEqual(vacio));
  it("con una lista o un número, empieza vacío", () => {
    expect(leerDatosPedido("[1,2]")).toEqual({ ...vacio });
    expect(leerDatosPedido("7")).toEqual(vacio);
  });
  it("conserva lo que sí sirve", () => {
    const guardado = JSON.stringify({ nombre: "Laura", entrega: "nacional", dir: "Cali", pago: "Daviplata", nota: "Azul" });
    expect(leerDatosPedido(guardado)).toEqual({ nombre: "Laura", entrega: "nacional", dir: "Cali", pago: "Daviplata", nota: "Azul" });
  });
  it("un campo con otra forma no rompe el carrito: queda vacío", () => {
    const d = leerDatosPedido(JSON.stringify({ nombre: 42, entrega: "marte", dir: null, nota: { a: 1 } }));
    expect(d).toEqual(vacio);
  });
  it("recorta textos exagerados", () => {
    expect(leerDatosPedido(JSON.stringify({ nombre: "x".repeat(5000) })).nombre).toHaveLength(120);
  });
});
