import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CONFIG, PRODUCTOS } from "../data/catalogo";
import { TiendaProvider, claveLinea, useTienda } from "../estado/TiendaContext";
import { dinero } from "../lib/formato";
import { Carrito } from "./Carrito";

const producto = PRODUCTOS.find(p => !p.consultar && p.stock == null);
if (!producto) throw new Error("El catálogo no tiene productos con precio");
const precio = producto.opciones[0]?.precio ?? 0;
const CLAVE = "rocketfix-carrito-v3-" + CONFIG.whatsapp;
const espera = (ms: number) => new Promise(r => setTimeout(r, ms));

function BotonAbrir() {
  const { abrirCarrito, unidades } = useTienda();
  return <button type="button" onClick={abrirCarrito}>Abrir carrito ({unidades})</button>;
}
const montar = (carrito: Record<string, number>) => {
  localStorage.setItem(CLAVE, JSON.stringify(carrito));
  return render(<TiendaProvider><div id="pagina"><BotonAbrir /></div><Carrito /></TiendaProvider>);
};

describe("carrito", () => {
  it("lo guardado con cantidades raras o productos que ya no existen se descarta", () => {
    montar({ [claveLinea(producto.id, 0)]: 2, [claveLinea(producto.id, 99)]: 1, "no-existe~0": 3, [claveLinea(PRODUCTOS[1]?.id ?? "x", 0)]: 1.5 });
    expect(screen.getByRole("button", { name: "Abrir carrito (2)" })).toBeInTheDocument();
  });

  it("al sumar o restar una unidad con el teclado, el foco se queda en el botón", async () => {
    const usuario = userEvent.setup();
    montar({ [claveLinea(producto.id, 0)]: 2 });
    await usuario.click(screen.getByRole("button", { name: /abrir carrito/i }));
    // Al abrir, el foco entra al panel (botón de cerrar)
    await waitFor(() => expect(screen.getByRole("button", { name: "Cerrar carrito" })).toHaveFocus());

    const mas = screen.getByRole("button", { name: "Agregar una unidad" });
    mas.focus();
    await usuario.keyboard("{Enter}");
    await espera(80); // el error viejo movía el foco 30 ms después
    expect(mas).toHaveFocus();
    expect(screen.getByRole("button", { name: /abrir carrito \(3\)/i })).toBeInTheDocument();

    const menos = screen.getByRole("button", { name: "Quitar una unidad" });
    menos.focus();
    await usuario.keyboard("{Enter}");
    await espera(80);
    expect(menos).toHaveFocus();
  });

  it("Esc cierra el carrito y devuelve el foco al botón que lo abrió", async () => {
    const usuario = userEvent.setup();
    montar({ [claveLinea(producto.id, 0)]: 1 });
    const abrir = screen.getByRole("button", { name: /abrir carrito/i });
    await usuario.click(abrir);
    await waitFor(() => expect(screen.getByRole("button", { name: "Cerrar carrito" })).toHaveFocus());
    await usuario.keyboard("{Escape}");
    await waitFor(() => expect(abrir).toHaveFocus());
  });

  it("el enlace de WhatsApp lleva el pedido con el total, y no se abre si faltan el nombre o la dirección", async () => {
    const usuario = userEvent.setup();
    montar({ [claveLinea(producto.id, 0)]: 1 });
    await usuario.click(screen.getByRole("button", { name: /abrir carrito/i }));
    const enviar = screen.getByRole("link", { name: /enviar pedido por whatsapp/i });

    // Los dos campos obligatorios lo dicen desde el principio
    expect(screen.getByLabelText("Tu nombre")).toHaveAttribute("aria-required", "true");
    expect(screen.getByLabelText(/dirección y barrio/i)).toHaveAttribute("aria-required", "true");

    // Sin datos: avisa qué falta, y los campos marcados apuntan al aviso
    enviar.addEventListener("click", e => e.preventDefault());
    await usuario.click(enviar);
    const aviso = await screen.findByRole("alert");
    expect(aviso).toHaveTextContent(/completa/i);
    expect(screen.getByLabelText("Tu nombre")).toHaveAccessibleDescription(aviso.textContent ?? "");

    await usuario.type(screen.getByLabelText("Tu nombre"), "Laura Gómez");
    await usuario.type(screen.getByLabelText(/dirección y barrio/i), "Calle 1 # 2-3");
    const destino = new URL(enviar.getAttribute("href") ?? "");
    expect(destino.origin + destino.pathname).toBe(`https://wa.me/${CONFIG.whatsapp}`);
    const mensaje = destino.searchParams.get("text") ?? "";
    const envio = precio >= CONFIG.envios.bogota.gratisDesde ? 0 : CONFIG.envios.bogota.costo;
    expect(mensaje).toContain(producto.nombre);
    expect(mensaje).toContain(`Total: ${dinero(precio + envio)}`);
    expect(mensaje).toContain("Nombre: Laura Gómez");
    expect(mensaje).toContain("Dirección: Calle 1 # 2-3");
  });
});
