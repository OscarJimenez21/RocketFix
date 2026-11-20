/* 19/11/2026: secciones de la portada que ahora empiezan cerradas para que la página sea más corta en celular.
   Se prueba que se abren con su botón y con su enlace directo (#calificaciones, #orden) */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Calificaciones } from "../../components/Calificaciones";
import { RESENAS, SERVICIOS } from "../../data/catalogo";
import { Servicios } from "./Servicios";

class Observador {
  constructor(private alVer: IntersectionObserverCallback) {}
  observe(target: Element) { this.alVer([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", Observador);
  Element.prototype.scrollIntoView = function () {};
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("calificaciones mientras hay menos de 3 publicadas", () => {
  it("es una franja corta y el formulario se abre con su botón", async () => {
    expect(RESENAS.length).toBeLessThan(3);
    render(<Calificaciones />);
    expect(screen.queryByText(/Todavía no hay calificaciones/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Califica tu experiencia" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Calificar mi experiencia" }));
    expect(screen.getByRole("heading", { name: "Califica tu experiencia" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Calificar mi experiencia" })).not.toBeInTheDocument();
  });

  it("llega abierta con el enlace #calificaciones", () => {
    render(<Calificaciones abrir />);
    expect(screen.getByRole("heading", { name: "Califica tu experiencia" })).toBeInTheDocument();
  });
});

describe("servicio técnico", () => {
  const enviar = () => screen.queryByRole("link", { name: /Enviar solicitud por WhatsApp/ });

  it("el formulario empieza cerrado y se abre con «Llenar la solicitud»", async () => {
    render(<Servicios />);
    expect(enviar()).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Llenar la solicitud" }));
    expect(enviar()).toBeInTheDocument();
  });

  it("«Solicitar cotización» de una tarjeta abre el formulario con ese servicio elegido", async () => {
    render(<Servicios />);
    const primero = SERVICIOS.find(s => !s.camaras);
    const [boton] = screen.getAllByRole("button", { name: "Solicitar cotización" });
    if (!primero || !boton) throw new Error("Faltan las tarjetas de reparación");
    await userEvent.click(boton);
    expect(enviar()).toBeInTheDocument();
    expect(screen.getByDisplayValue(primero.titulo)).toBeInTheDocument();
  });

  it("llega abierto con el enlace #orden", () => {
    render(<Servicios abrir />);
    expect(enviar()).toBeInTheDocument();
  });
});
