import { describe, expect, it } from "vitest";
import { srcsetFoto } from "./formato";

describe("fotos livianas", () => {
  it("una foto de producto ofrece sus copias WebP de 300 y 600 px y la original de 800 px", () => {
    const base = import.meta.env.BASE_URL;
    expect(srcsetFoto("fotos/ip18pm.jpg")).toBe(`${base}fotos/liviana/300/ip18pm.webp 300w, ${base}fotos/liviana/600/ip18pm.webp 600w, ${base}fotos/ip18pm.jpg 800w`);
  });

  it("las fotos de la galería conservan su carpeta", () => {
    expect(srcsetFoto("fotos/galeria/ss25u-2.jpg")).toContain("fotos/liviana/600/galeria/ss25u-2.webp 600w");
  });

  it("lo que no es una foto JPG de producto no tiene copias", () => {
    expect(srcsetFoto("fotos/recortes/ip18pm.webp")).toBeUndefined();
    expect(srcsetFoto("https://ejemplo.com/fotos/a.jpg")).toBeUndefined();
    expect(srcsetFoto("fotos/otra/carpeta/a.jpg")).toBeUndefined();
  });
});
