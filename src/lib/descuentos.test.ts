/* 26/11/2026: 5 % pagando en efectivo o transferencia, sin descuento con tarjeta, y códigos de descuento */
import { describe, expect, it } from "vitest";
import { CONFIG } from "../data/catalogo";
import { PAGO_BOLD, calcularTotales, pagoConDescuento, precioConDescuento, revisarCodigo, type Codigo } from "./descuentos";

describe("5% por efectivo o transferencia", () => {
  it("aplica a efectivo, Bre-B, Daviplata y transferencia", () => {
    for (const p of [...CONFIG.pagos.bogota, ...CONFIG.pagos.nacional].filter(p => !/tarjeta/i.test(p))) expect(pagoConDescuento(p)).toBe(true);
  });
  it("no aplica con tarjeta contra entrega ni con Bold", () => {
    for (const p of CONFIG.pagos.bogota.filter(p => /tarjeta/i.test(p))) expect(pagoConDescuento(p)).toBe(false);
    expect(pagoConDescuento(PAGO_BOLD)).toBe(false);
    expect(pagoConDescuento("")).toBe(false);
  });
  it("se calcula sobre los productos, no sobre el envío, redondeado a la centena", () => {
    const t = calcularTotales(1_234_567, 15_000, "Transferencia bancaria");
    expect(t.descuentoPago).toBe(61_700);
    expect(t.total).toBe(1_234_567 - 61_700 + 15_000);
  });
  it("con tarjeta el total es el precio completo", () => {
    expect(calcularTotales(1_000_000, 0, PAGO_BOLD)).toEqual({ descuentoCodigo: 0, descuentoPago: 0, total: 1_000_000 });
  });
  it("precio de una tarjeta de producto con el 5%", () => expect(precioConDescuento(1_000_000)).toBe(950_000));
});

describe("códigos de descuento", () => {
  const lista: Codigo[] = [
    { codigo: "BIENVENIDO", porcentaje: 10, minimo: 300_000, hasta: "2026-12-31" },
    { codigo: "MENOS50", valor: 50_000, desde: "2026-12-01" },
  ];
  const hoy = new Date(2026, 10, 26);
  it("acepta el código sin importar mayúsculas ni espacios", () => {
    expect(revisarCodigo(" bienvenido ", 500_000, hoy, lista)).toMatchObject({ ok: true, monto: 50_000 });
  });
  it("rechaza códigos que no existen, fuera de fecha o por debajo del mínimo", () => {
    expect(revisarCodigo("OTRO", 500_000, hoy, lista).ok).toBe(false);
    expect(revisarCodigo("MENOS50", 500_000, hoy, lista).ok).toBe(false);
    expect(revisarCodigo("BIENVENIDO", 200_000, hoy, lista).ok).toBe(false);
    expect(revisarCodigo("BIENVENIDO", 500_000, new Date(2027, 0, 1), lista).ok).toBe(false);
  });
  it("un valor fijo nunca deja el pedido en negativo", () => {
    expect(revisarCodigo("MENOS50", 30_000, new Date(2026, 11, 5), lista)).toMatchObject({ ok: true, monto: 30_000 });
  });
  it("mientras no haya códigos publicados, ninguno sirve", () => {
    expect(revisarCodigo("BIENVENIDO", 500_000).ok).toBe(false);
  });
});
