/* Se ejecuta antes de cada archivo de pruebas. Agrega las comprobaciones de pantalla (toHaveFocus, toBeVisible…)
   y lo poco que al navegador simulado le falta y la tienda usa. */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// El navegador simulado no trae matchMedia: la tienda lo usa para saber si la persona pidió menos movimiento
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false
  });
}
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
