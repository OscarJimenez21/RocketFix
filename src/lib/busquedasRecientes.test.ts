import { beforeEach, describe, expect, it } from "vitest";
import { anotarBusqueda, borrarBusquedas } from "./busquedasRecientes";

const guardadas = () => JSON.parse(localStorage.getItem("rf-busquedas") || "[]") as string[];

describe("búsquedas recientes", () => {
  beforeEach(() => borrarBusquedas());

  it("guarda la última primero y sin repetir (sin importar mayúsculas)", () => {
    anotarBusqueda("iphone");
    anotarBusqueda("samsung");
    anotarBusqueda("  IPhone ");
    expect(guardadas()).toEqual(["IPhone", "samsung"]);
  });

  it("guarda máximo 5", () => {
    for (const q of ["a1", "b2", "c3", "d4", "e5", "f6"]) anotarBusqueda(q);
    expect(guardadas()).toEqual(["f6", "e5", "d4", "c3", "b2"]);
  });

  it("no guarda búsquedas de una letra ni vacías", () => {
    anotarBusqueda("x");
    anotarBusqueda("   ");
    expect(guardadas()).toEqual([]);
  });

  it("borrar deja la lista vacía", () => {
    anotarBusqueda("xiaomi");
    borrarBusquedas();
    expect(guardadas()).toEqual([]);
  });
});
