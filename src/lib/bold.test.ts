import { beforeEach, describe, expect, it, vi } from "vitest";

/** bold.ts lee la dirección una sola vez y recuerda el resultado: cada prueba lo carga de nuevo */
async function alVolverCon(busqueda: string) {
  window.history.replaceState(null, "", "/" + busqueda);
  vi.resetModules();
  const { leerRegresoBold } = await import("./bold");
  return leerRegresoBold();
}

describe("regreso de Bold a la tienda", () => {
  beforeEach(() => localStorage.clear());

  it("sin datos en la dirección no hay regreso", async () => {
    expect(await alVolverCon("")).toBeNull();
  });

  it("un enlace armado por otra persona no cuenta: este navegador no inició ese pago", async () => {
    expect(await alVolverCon("?pedido=RFABC12345&bold-tx-status=approved")).toBeNull();
    // y la dirección queda limpia
    expect(location.search).toBe("");
  });

  it("una referencia con otra forma no cuenta, aunque esté guardada", async () => {
    localStorage.setItem("rf-pago-<b>hola</b>", "pedido");
    expect(await alVolverCon("?pedido=%3Cb%3Ehola%3C%2Fb%3E&bold-tx-status=approved")).toBeNull();
  });

  it("un estado con forma rara no cuenta", async () => {
    const { clavePago } = await import("./bold");
    localStorage.setItem(clavePago("RFABC12345"), "pedido");
    expect(await alVolverCon("?pedido=RFABC12345&bold-tx-status=%3Cscript%3E")).toBeNull();
  });

  it("el pago que inició este navegador sí cuenta", async () => {
    const { clavePago, nuevaReferencia } = await import("./bold");
    const ref = nuevaReferencia();
    localStorage.setItem(clavePago(ref), "Hola, quiero hacer este pedido");
    expect(await alVolverCon(`?pedido=${ref}&bold-tx-status=approved`)).toEqual({ ref, estado: "approved" });
    expect(location.search).toBe("");
  });

  it("la segunda lectura devuelve lo mismo (React la repite al desarrollar)", async () => {
    const { clavePago } = await import("./bold");
    localStorage.setItem(clavePago("RFABC12345"), "pedido");
    window.history.replaceState(null, "", "/?pedido=RFABC12345&bold-tx-status=pending");
    vi.resetModules();
    const { leerRegresoBold } = await import("./bold");
    const primera = leerRegresoBold();
    expect(primera).toEqual({ ref: "RFABC12345", estado: "pending" });
    expect(leerRegresoBold()).toBe(primera);
  });
});
