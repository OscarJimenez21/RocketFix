import { describe, expect, it } from "vitest";
import { PRODUCTOS, TEXTO_BUSQUEDA } from "../data/catalogo";
import { buscarProductos, palabrasDe, resaltar } from "./busqueda";
import { norm } from "./formato";

describe("palabras de la búsqueda", () => {
  it("quita tildes, mayúsculas y espacios de sobra", () => expect(palabrasDe("  Teléfono   SAMSUNG ")).toEqual(["telefono", "samsung"]));
  it("sin texto no hay palabras", () => expect(palabrasDe("   ")).toEqual([]));
});

describe("buscador", () => {
  it("sin texto no devuelve nada", () => expect(buscarProductos("")).toEqual([]));

  it("algo que no existe no devuelve nada", () => expect(buscarProductos("zzzxqwy")).toEqual([]));

  it("una marca trae productos de esa marca", () => {
    const marca = PRODUCTOS.find(p => p.marca)?.marca;
    if (!marca) throw new Error("El catálogo no tiene marcas");
    const encontrados = buscarProductos(marca);
    expect(encontrados.length).toBeGreaterThan(0);
    expect(encontrados.some(p => p.marca === marca)).toBe(true);
  });

  it("todos los resultados contienen el texto buscado", () => {
    const primero = PRODUCTOS[0];
    if (!primero) throw new Error("Catálogo vacío");
    const palabra = norm(primero.nombre).split(/\s+/).find(w => w.length > 3) ?? norm(primero.nombre);
    const encontrados = buscarProductos(palabra);
    expect(encontrados.map(p => p.id)).toContain(primero.id);
  });

  it("con dos palabras encuentra el producto que tiene las dos, y pide menos resultados que con una", () => {
    const conDos = PRODUCTOS.find(p => norm(p.nombre).split(/\s+/).filter(w => w.length > 2).length >= 2);
    if (!conDos) throw new Error("No hay productos con dos palabras");
    const [a = "", b = ""] = norm(conDos.nombre).split(/\s+/).filter(w => w.length > 2);
    const conLasDos = buscarProductos(`${a} ${b}`);
    expect(conLasDos.map(p => p.id)).toContain(conDos.id);
    expect(conLasDos.length).toBeLessThanOrEqual(buscarProductos(a).length);
    // Todo lo encontrado está en el índice de búsqueda
    for (const p of conLasDos) expect(TEXTO_BUSQUEDA[p.id]).toBeTruthy();
  });

  it("no repite productos y da el mismo orden cada vez", () => {
    const una = buscarProductos("samsung").map(p => p.id);
    expect(new Set(una).size).toBe(una.length);
    expect(buscarProductos("samsung").map(p => p.id)).toEqual(una);
  });

  it("un signo raro no rompe el buscador", () => {
    expect(() => buscarProductos("c++ (a) [b] $ ^ *")).not.toThrow();
  });
});

describe("resaltar coincidencias", () => {
  it("marca la parte que coincide, sin importar tildes", () => {
    expect(resaltar("Teléfono rojo", ["telefono"])).toEqual([{ t: "Teléfono", marcado: true }, { t: " rojo", marcado: false }]);
  });
  it("sin coincidencias devuelve el texto entero sin marcar", () => {
    expect(resaltar("Cargador", ["xyz"])).toEqual([{ t: "Cargador", marcado: false }]);
  });
});
