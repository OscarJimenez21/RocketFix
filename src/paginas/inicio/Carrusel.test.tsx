import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRODUCTOS } from "../../data/catalogo";
import { Carrusel } from "./Carrusel";

// El carrusel solo avanza mientras se ve: en las pruebas siempre "se ve"
class Observador {
  constructor(private alVer: IntersectionObserverCallback) {}
  observe() { this.alVer([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
  unobserve() {}
  disconnect() {}
}

describe("fila de productos de la portada", () => {
  const productos = PRODUCTOS.filter(p => p.imagen && !p.consultar).slice(0, 6);
  let avances = 0;
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("IntersectionObserver", Observador);
    avances = 0;
    Element.prototype.scrollBy = function () { avances++; };
    Element.prototype.scrollTo = function () { avances++; };
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("avanza sola y el botón de pausa la detiene hasta que se vuelva a presionar", async () => {
    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Carrusel id="prueba" etiqueta="Prueba" titulo="Fila de prueba" productos={productos} />);
    act(() => { vi.advanceTimersByTime(3600); });
    expect(avances).toBeGreaterThan(0);

    const pausa = screen.getByRole("button", { name: "Pausar la fila Fila de prueba" });
    expect(pausa).toHaveAttribute("aria-pressed", "false");
    await usuario.click(pausa);
    // Al hacer clic el mouse queda encima de la fila de botones, no de la fila de productos: lo que la detiene es la pausa
    expect(pausa).toHaveAttribute("aria-pressed", "true");
    const antes = avances;
    act(() => { vi.advanceTimersByTime(10000); });
    expect(avances).toBe(antes);

    await usuario.click(pausa);
    expect(pausa).toHaveAttribute("aria-pressed", "false");
    act(() => { vi.advanceTimersByTime(3600); });
    expect(avances).toBeGreaterThan(antes);
  });
});
