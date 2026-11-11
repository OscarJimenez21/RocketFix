import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CONFIG } from "../data/catalogo";
import { Limite } from "./Limite";

function Rota(): never {
  throw new Error("fallo de prueba");
}

describe("aviso cuando una página falla", () => {
  it("si todo va bien, muestra la página", () => {
    render(<Limite><p>contenido</p></Limite>);
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });

  it("si la página falla al dibujarse, muestra el aviso con WhatsApp en vez de quedar en blanco", () => {
    // React y el navegador simulado escriben el error en la consola: se silencian para no ensuciar el resultado de las pruebas
    vi.spyOn(console, "error").mockImplementation(() => {});
    const callar = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener("error", callar);
    render(<Limite><Rota /></Limite>);
    window.removeEventListener("error", callar);
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos mostrar esta página");
    expect(screen.getByRole("button", { name: "Recargar la página" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /escribir por whatsapp/i }).getAttribute("href")).toContain(`https://wa.me/${CONFIG.whatsapp}`);
  });
});
