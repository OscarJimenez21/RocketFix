import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BUSQUEDAS_POPULARES, PRODUCTOS } from "../data/catalogo";
import { Buscador } from "./Buscador";

describe("buscador", () => {
  it("las búsquedas populares forman una lista que solo tiene opciones, con su título fuera", async () => {
    const usuario = userEvent.setup();
    render(<Buscador />);
    const campo = screen.getByRole("combobox");
    await usuario.click(campo);
    const lista = screen.getByRole("listbox", { name: "Búsquedas populares" });
    expect(campo).toHaveAttribute("aria-controls", lista.id);
    expect(campo).toHaveAttribute("aria-expanded", "true");
    // Todo lo que hay dentro de la lista es una opción
    expect([...lista.children].every(h => h.getAttribute("role") === "option")).toBe(true);
    expect(within(lista).getAllByRole("option")).toHaveLength(BUSQUEDAS_POPULARES.length);
  });

  it("con resultados, las sugerencias son opciones y la flecha abajo marca la primera", async () => {
    const usuario = userEvent.setup();
    const p = PRODUCTOS.find(x => x.nombre.length > 6);
    if (!p) throw new Error("catálogo vacío");
    const palabra = p.nombre.split(" ")[0] ?? p.nombre;
    render(<Buscador />);
    const campo = screen.getByRole("combobox");
    await usuario.type(campo, palabra);
    const lista = screen.getByRole("listbox", { name: "Sugerencias de búsqueda" });
    expect([...lista.children].every(h => h.getAttribute("role") === "option")).toBe(true);
    await usuario.keyboard("{ArrowDown}");
    const primera = within(lista).getAllByRole("option")[0];
    expect(campo).toHaveAttribute("aria-activedescendant", primera?.id);
  });

  it("sin resultados no hay lista abierta: solo el aviso, que el lector de pantalla anuncia", async () => {
    const usuario = userEvent.setup();
    render(<Buscador />);
    const campo = screen.getByRole("combobox");
    await usuario.type(campo, "zzqqxxwwkk");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(campo).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("status")).toHaveTextContent(/no encontramos/i);
  });
});
