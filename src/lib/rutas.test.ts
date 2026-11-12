import { describe, expect, it } from "vitest";
import { ARTICULOS, PRODUCTOS, TIENDA_VISTA } from "../data/catalogo";
import { BASE, claveRuta, direccionDe, hrefBusqueda, hrefDe, hrefMarca, hrefProducto, leerRuta } from "./rutas";

describe("direcciones de la tienda", () => {
  it("vacío o #inicio es la portada", () => {
    expect(leerRuta("")).toEqual({ tipo: "inicio" });
    expect(leerRuta("#inicio")).toEqual({ tipo: "inicio" });
    expect(leerRuta("#/")).toEqual({ tipo: "inicio" });
    expect(leerRuta(BASE)).toEqual({ tipo: "inicio" });
  });

  it("las secciones de la portada no son páginas aparte", () => {
    expect(leerRuta("#servicios")).toEqual({ tipo: "inicio", ancla: "servicios" });
    expect(leerRuta("#como-comprar")).toEqual({ tipo: "inicio", ancla: "como-comprar" });
    expect(hrefDe("servicios")).toBe(`${BASE}#servicios`);
    expect(leerRuta(hrefDe("servicios"))).toEqual({ tipo: "inicio", ancla: "servicios" });
  });

  it("cada sección de la tienda abre su página, con dirección limpia o con la vieja de #", () => {
    for (const [tienda, vista] of Object.entries(TIENDA_VISTA)) {
      expect(leerRuta(`#${vista}`)).toEqual({ tipo: "tienda", vista, tienda });
      expect(hrefDe(vista)).toBe(`${BASE}${vista}/`);
      expect(leerRuta(hrefDe(vista))).toEqual({ tipo: "tienda", vista, tienda });
    }
  });

  it("un producto se abre con su enlace, aunque el código tenga signos", () => {
    const p = PRODUCTOS[0];
    if (!p) throw new Error("Catálogo vacío");
    expect(hrefProducto(p.id)).toBe(`${BASE}p/${encodeURIComponent(p.id)}/`);
    expect(leerRuta(hrefProducto(p.id))).toEqual({ tipo: "producto", id: p.id });
    expect(leerRuta(`#p/${p.id}`)).toEqual({ tipo: "producto", id: p.id });
    expect(leerRuta(hrefProducto("a b/ñ"))).toEqual({ tipo: "producto", id: "a b/ñ" });
  });

  it("la búsqueda y la marca conservan tildes y espacios", () => {
    expect(leerRuta(hrefBusqueda(" cargador rápido "))).toEqual({ tipo: "buscar", q: "cargador rápido" });
    expect(hrefMarca("Cooler Master")).toBe(`${BASE}marca/cooler-master/`);
    expect(leerRuta(hrefMarca("Cooler Master"))).toEqual({ tipo: "marca", marca: "Cooler Master" });
    // Enlace viejo con el nombre de la marca
    expect(leerRuta("#marca/Cooler%20Master")).toEqual({ tipo: "marca", marca: "Cooler Master" });
  });

  it("un porcentaje suelto no rompe la página", () => {
    expect(leerRuta("#buscar/100%")).toEqual({ tipo: "buscar", q: "100%" });
  });

  it("los artículos y el blog", () => {
    expect(leerRuta("#blog")).toEqual({ tipo: "blog" });
    expect(leerRuta(`${BASE}blog/`)).toEqual({ tipo: "blog" });
    const a = ARTICULOS[0];
    if (!a) throw new Error("No hay artículos");
    expect(leerRuta(`#${a.id}`)).toEqual({ tipo: "articulo", id: a.id });
    expect(leerRuta(hrefDe(a.id))).toEqual({ tipo: "articulo", id: a.id });
  });

  it("lo que no existe va a «No la encontramos»", () => {
    expect(leerRuta("#esto-no-existe")).toEqual({ tipo: "no-encontrada", hash: "esto-no-existe" });
    expect(leerRuta(`${BASE}esto-no-existe/`)).toEqual({ tipo: "no-encontrada", hash: "esto-no-existe" });
  });

  it("ida y vuelta: cada página tiene una sola dirección", () => {
    const p = PRODUCTOS[0];
    if (!p) throw new Error("Catálogo vacío");
    for (const h of ["", "#celulares", `#p/${p.id}`, "#buscar/cargador", "#blog", "#servicios"]) {
      const r = leerRuta(h);
      expect(leerRuta(direccionDe(r))).toEqual(r);
    }
  });

  it("cada página tiene una clave distinta", () => {
    const claves = ["", "#celulares", "#p/x1", "#buscar/a", "#marca/a", "#blog", "#nada"].map(h => claveRuta(leerRuta(h)));
    expect(new Set(claves).size).toBe(claves.length);
  });
});
