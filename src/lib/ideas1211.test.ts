/* Pruebas de las ideas del 12/11/2026 (idea 80): festivos, filtros en la dirección, textos de ayuda, número de pedido,
   carrito y favoritos compartidos, y estados del equipo. */
import { describe, expect, it } from "vitest";
import ayudaJson from "../data/ayuda.json";
import { CONFIG, PRODUCTOS } from "../data/catalogo";
import type { LineaCarrito } from "../types";
import { GLOSARIO, plano, rellenar, trozos } from "./ayuda";
import { enlaceCarrito, leerCarritoCompartido } from "./carritoCompartido";
import { EXPLICACION_ESTADO, explicarEstado } from "./estados";
import { leerListaCompartida } from "./favoritos";
import { festivo, festivosDe, pascua } from "./festivos";
import { FILTROS_VACIOS, filtrosDeUrl, rangoPulgadas, urlDeFiltros } from "./filtros";
import { dinero } from "./formato";
import { estadoAtencion } from "./horario";
import { FRANJAS, leerDatosPedido, mensajePedido, nuevoNumeroPedido } from "./pedido";
import { INFO_IDS, leerRuta } from "./rutas";

describe("festivos de Colombia (idea 100)", () => {
  it("Pascua de 2026 es el 5 de abril", () => {
    const p = pascua(2026);
    expect([p.getFullYear(), p.getMonth() + 1, p.getDate()]).toEqual([2026, 4, 5]);
  });
  it("los 18 festivos de 2026", () => {
    expect([...festivosDe(2026).keys()].sort()).toEqual([
      "2026-01-01", "2026-01-12", "2026-03-23", "2026-04-02", "2026-04-03", "2026-05-01", "2026-05-18", "2026-06-08", "2026-06-15",
      "2026-06-29", "2026-07-20", "2026-08-07", "2026-08-17", "2026-10-12", "2026-11-02", "2026-11-16", "2026-12-08", "2026-12-25"
    ]);
  });
  it("un día normal no es festivo", () => expect(festivo(new Date(2026, 10, 12, 12))).toBeNull());
  it("en festivo la tienda aparece cerrada aunque sea lunes", () => {
    const e = estadoAtencion(new Date(2026, 10, 16, 11)); // lunes 16 de noviembre de 2026, festivo
    expect(e.abierto).toBe(false);
    expect(e.texto).toMatch(/festivo/i);
  });
});

describe("filtros en la dirección (idea 13)", () => {
  it("ida y vuelta: lo que se escribe en la dirección se vuelve a leer igual", () => {
    const f = { ...FILTROS_VACIOS, marca: "Apple", capacidad: "256 GB", orden: "menor", tope: 3000000, red: "5g" };
    expect({ ...FILTROS_VACIOS, ...filtrosDeUrl(urlDeFiltros(f)) }).toEqual(f);
  });
  it("sin filtros, la dirección queda limpia", () => expect(urlDeFiltros(FILTROS_VACIOS)).toBe(""));
  it("un orden desconocido o un tope inválido se ignoran", () => expect(filtrosDeUrl("?orden=raro&hasta=-5")).toEqual({}));
  it("los rangos de pantalla no dejan huecos", () => {
    expect(rangoPulgadas(35)).toBe("33″ a 49″");
    expect(rangoPulgadas(32)).toBe("25″ a 32″");
    expect(rangoPulgadas(55)).toBe("50″ o más");
  });
});

describe("textos de ayuda", () => {
  it("las páginas de ayuda de rutas.ts son las mismas de ayuda.json", () => {
    expect([...INFO_IDS].sort()).toEqual(ayudaJson.paginas.map(p => p.id).sort());
    for (const id of INFO_IDS) expect(leerRuta(`${id}/`)).toEqual({ tipo: "info", id });
  });
  it("todos los {datos} se llenan con config.json", () => {
    const todo = JSON.stringify(ayudaJson);
    const sinLlenar = rellenar(todo).match(/\{(envio|gratis|pagos|domicilio|horario|whatsapp)\w*\}/g);
    expect(sinLlenar).toBeNull();
    expect(rellenar("{envioBogota}")).toBe(dinero(CONFIG.envios.bogota.costo));
  });
  it("los enlaces internos llevan a páginas que existen", () => {
    const todo = JSON.stringify(ayudaJson);
    for (const m of todo.matchAll(/\]\(([^)\s]+)\)/g)) {
      const ruta = m[1] ?? "";
      if (/^https?:/.test(ruta) || ruta === "ruta") continue;
      expect(leerRuta(ruta).tipo, ruta).not.toBe("no-encontrada");
    }
  });
  it("trozos y plano separan los enlaces del texto", () => {
    expect(trozos("Mira [la garantía](garantia) hoy")).toEqual([{ texto: "Mira " }, { texto: "la garantía", ruta: "garantia" }, { texto: " hoy" }]);
    expect(plano("Mira [la garantía](garantia).")).toBe("Mira la garantía.");
  });
});

describe("estado del equipo (idea 22)", () => {
  it("los textos de la ficha son los mismos del glosario", () => {
    for (const [estado, texto] of Object.entries(EXPLICACION_ESTADO)) {
      expect(GLOSARIO.find(g => g.t.toLowerCase().startsWith(estado.toLowerCase()))?.d, estado).toBe(texto);
    }
  });
  it("Nuevo y estados desconocidos no llevan explicación", () => {
    expect(explicarEstado("Nuevo")).toBeNull();
    expect(explicarEstado("Otro")).toBeNull();
    expect(explicarEstado("CPO")).toMatch(/revisó/);
  });
});

describe("número y franja del pedido (ideas 34 y 35)", () => {
  const producto = PRODUCTOS.find(p => !p.consultar);
  if (!producto) throw new Error("sin productos con precio");
  const opcion = producto.opciones[0];
  if (!opcion) throw new Error("sin versiones");
  const lineas: LineaCarrito[] = [{ producto, opcion, indice: 0, clave: `${producto.id}~0`, cantidad: 1 }];

  it("el número tiene la forma RF-XXXXX sin letras que se confundan", () => {
    for (let k = 0; k < 50; k++) expect(nuevoNumeroPedido()).toMatch(/^RF-[2-9A-HJ-NP-Z]{5}$/);
  });
  it("el mensaje lleva el número y la franja elegida", () => {
    const d = { ...leerDatosPedido(null), nombre: "Ana", dir: "Calle 1", franja: FRANJAS[1] };
    const m = mensajePedido(lineas, d, undefined, "RF-ABC23");
    expect(m).toContain("quiero hacer este pedido (n.º RF-ABC23):");
    expect(m).toContain("Prefiere recibirlo: en la tarde");
  });
  it("sin número ni franja, el mensaje queda como antes", () => {
    const m = mensajePedido(lineas, { ...leerDatosPedido(null), nombre: "Ana", dir: "Calle 1" });
    expect(m).toContain("quiero hacer este pedido:");
    expect(m).not.toContain("Prefiere recibirlo");
  });
  it("una franja guardada que no existe se descarta", () => {
    expect(leerDatosPedido(JSON.stringify({ franja: "Noche" })).franja).toBeUndefined();
    expect(leerDatosPedido(JSON.stringify({ franja: "Mañana" })).franja).toBe("Mañana");
  });
});

describe("carrito y favoritos compartidos (ideas 38 y 99)", () => {
  it("el enlace del carrito se vuelve a leer igual", () => {
    const url = enlaceCarrito([{ clave: "sa07~0", cantidad: 2 }, { clave: "ab12~3", cantidad: 1 }], "https://x.co", "/RocketFix/");
    expect(leerCarritoCompartido(new URL(url).search)).toEqual({ "sa07~0": 2, "ab12~3": 1 });
  });
  it("partes mal formadas o cantidades exageradas no pasan", () => {
    expect(leerCarritoCompartido("?carrito=sa07~0~999,malo,~1~2,x~0~0")).toEqual({ "sa07~0": 20 });
  });
  it("la lista de favoritos compartida quita repetidos y basura", () => {
    expect(leerListaCompartida("?lista=a1,b2,a1,,c%20d")).toEqual(["a1", "b2"]);
  });
});
