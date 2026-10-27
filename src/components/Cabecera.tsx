import { CONFIG } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { useTienda } from "../estado/TiendaContext";
import { waLink } from "../lib/whatsapp";
import type { Ruta } from "../types";
import { Buscador } from "./Buscador";
import { IconoBolsa, IconoWhatsApp } from "./Iconos";
import { Logo } from "./Logo";

export function Cabecera({ ruta }: { ruta: Ruta }) {
  const { unidades, abrirCarrito } = useTienda();
  const actual = ruta.tipo === "tienda" ? ruta.vista : ruta.tipo === "blog" || ruta.tipo === "articulo" ? "blog" : "";
  const q = ruta.tipo === "buscar" ? ruta.q : "";

  return (
    <header className="sticky top-0 z-40 border-b border-linea bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="contenedor flex flex-wrap items-center gap-x-6 gap-y-2.5 py-3">
        <a href="#inicio" className="shrink-0" aria-label="Rocket Fix, ir al inicio"><Logo /></a>
        <div className="order-3 w-full md:order-none md:w-auto md:flex-1 md:max-w-xl"><Buscador inicial={q} /></div>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Botón de WhatsApp: en celular solo el ícono, en pantallas grandes con texto */}
          <a href={waLink(`Hola ${CONFIG.nombre}, `)} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"
            className="inline-flex h-11 min-w-[44px] items-center justify-center gap-2 rounded bg-wa px-3 text-sm font-semibold text-white transition-colors hover:bg-wa-hover sm:px-3.5">
            <IconoWhatsApp className="h-5 w-5" />
            <span className="hidden sm:inline xl:hidden">WhatsApp</span>
            <span className="hidden xl:inline">Escríbenos por WhatsApp</span>
          </a>
          <button type="button" onClick={abrirCarrito}
            aria-label={`Abrir carrito, ${unidades} ${unidades === 1 ? "producto" : "productos"}`}
            className="relative inline-flex h-11 items-center gap-2 rounded border border-linea-fuerte px-3.5 text-sm font-semibold hover:border-tinta-2">
            <IconoBolsa />
            <span className="hidden sm:inline">Carrito</span>
            <span className={`min-w-[22px] rounded-full px-1.5 py-0.5 text-center font-mono text-xs ${unidades ? "bg-acento text-white" : "bg-fondo text-tinta-2"}`}>{unidades}</span>
          </button>
        </div>
      </div>
      <nav aria-label="Secciones de la tienda" className="border-t border-linea/70">
        <div className="contenedor">
          <ul className="sin-barra -mx-1 flex gap-0.5 overflow-x-auto">
            {TIENDAS.map(t => (
              <li key={t.id} className="shrink-0">
                <a href={`#${t.vista}`} aria-current={actual === t.vista ? "page" : undefined}
                  className={`block border-b-2 px-2.5 py-2.5 text-[14px] font-medium transition-colors ${actual === t.vista ? "border-marca text-tinta" : "border-transparent text-tinta-2 hover:text-tinta"}`}>
                  {t.menu}
                </a>
              </li>
            ))}
            <li className="shrink-0">
              <a href="#blog" aria-current={actual === "blog" ? "page" : undefined}
                className={`block border-b-2 px-2.5 py-2.5 text-[14px] font-semibold transition-colors ${actual === "blog" ? "border-marca text-marca" : "border-transparent text-marca hover:text-marca-hover"}`}>
                Servicio técnico
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
