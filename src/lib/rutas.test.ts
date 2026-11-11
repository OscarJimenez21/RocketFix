import { describe, expect, it } from "vitest";
import { ARTICULOS, PRODUCTOS, TIENDA_VISTA } from "../data/catalogo";
import { claveRuta, hrefBusqueda, hrefMarca, hrefProducto, leerRuta } from "./rutas";

describe("direcciones de la tienda", () => {
  it("vacío o #inicio es la portada", () => {
    expect(leerRuta("")).toEqual({ tipo: "inicio" });
    expect(leerRuta("#inicio")).toEqual({ tipo: "inicio" });
    expect(leerRuta("#/")).toEqual({ tipo: "inicio" });
  });

  it("las secciones de la portada no son páginas aparte", () => {
    expect(leerRuta("#servicios")).toEqual({ tipo: "inicio", ancla: "servicios" });
    expect(leerRuta("#como-comprar")).toEqual({ tipo: "inicio", ancla: "como-comprar" });
  });

  it("cada sección de la tienda abre su página", () => {
    for (const [tienda, vista] of Object.entries(TIENDA_VISTA)) {
      expect(leerRuta(`#${vista}`)).toEqual({ tipo: "tienda", vista, tienda });
    }
  });

  it("un producto se abre con su enlace, aunque el código tenga signos", () => {
    const p = PRODUCTOS[0];
    if (!p) throw new Error("Catálogo vacío");
    expect(leerRuta(hrefProducto(p.id))).toEqual({ tipo: "producto", id: p.id });
    expect(leerRuta(hrefProducto("a b/ñ"))).toEqual({ tipo: "producto", id: "a b/ñ" });
  });

  it("la búsqueda y la marca conservan tildes y espacios", () => {
    expect(leerRuta(hrefBusqueda(" cargador rápido "))).toEqual({ tipo: "buscar", q: "cargador rápido" });
    expect(leerRuta(hrefMarca("Cooler Master"))).toEqual({ tipo: "marca", marca: "Cooler Master" });
  });

  it("un porcentaje suelto no rompe la página", () => {
    expect(leerRuta("#buscar/100%")).toEqual({ tipo: "buscar", q: "100%" });
  });

  it("los artículos y el blog", () => {
    expect(leerRuta("#blog")).toEqual({ tipo: "blog" });
    const a = ARTICULOS[0];
    if (!a) throw new Error("No hay artículos");
    expect(leerRuta(`#${a.id}`)).toEqual({ tipo: "articulo", id: a.id });
  });

  it("lo que no existe va a «No la encontramos»", () => {
    expect(leerRuta("#esto-no-existe")).toEqual({ tipo: "no-encontrada", hash: "esto-no-existe" });
  });

  it("cada página tiene una clave distinta", () => {
    const claves = ["", "#celulares", "#p/x1", "#buscar/a", "#marca/a", "#blog", "#nada"].map(h => claveRuta(leerRuta(h)));
    expect(new Set(claves).size).toBe(claves.length);
  });
});
