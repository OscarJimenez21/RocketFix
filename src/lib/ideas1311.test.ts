/* Pruebas de las ideas aprobadas el 13/11/2026: catálogo en PDF para descargar (idea 69). */
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOGO_PDF, pesoCatalogo } from "./catalogoPdf";

describe("catálogo en PDF (idea 69)", () => {
  const ruta = join(process.cwd(), "public", CATALOGO_PDF.archivo);
  it("el archivo está en public/", () => expect(existsSync(ruta)).toBe(true));
  it("el peso que dice la página es el del archivo", () => {
    expect(Math.round(statSync(ruta).size / 1e6)).toBe(CATALOGO_PDF.megas);
    expect(pesoCatalogo).toBe(`PDF, ${CATALOGO_PDF.megas} MB`);
  });
  it("es un PDF de verdad", () => {
    const inicio = Buffer.alloc(5);
    const fd = openSync(ruta, "r");
    readSync(fd, inicio, 0, 5, 0);
    closeSync(fd);
    expect(inicio.toString("latin1")).toBe("%PDF-");
  });
});
