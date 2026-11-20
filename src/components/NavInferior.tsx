/* 20/11/2026 (usuario: «todo lo que hacen las que más venden, aplícalo»): barra fija abajo en celular y tableta, como
   en Alkosto, Ktronix o Mercado Libre: Inicio, Categorías, Buscar, Favoritos y Carrito siempre a un toque del pulgar.
   - No sale en la página de producto: ahí abajo va la barra con el precio y «Agregar» (BarraAgregar en Producto.tsx).
   - Su alto se anuncia en --barra-abajo, la misma variable que ya usan el botón de WhatsApp, el de subir y los avisos
     para quedar encima de lo que haya abajo.
   - En computador no existe (lg:hidden): la cabecera ya tiene todo a la vista. */
import { useEffect, useRef } from "react";
import { useTienda } from "../estado/TiendaContext";
import { hrefDe } from "../lib/rutas";
import type { Ruta } from "../types";
import { IconoBolsa, IconoBuscar, IconoCasa, IconoCuadricula } from "./Iconos";

function IconoCorazon({ className = "h-[22px] w-[22px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
    </svg>
  );
}

export function NavInferior({ ruta }: { ruta: Ruta }) {
  const { unidades, abrirCarrito } = useTienda();
  const barra = useRef<HTMLElement>(null);
  const oculta = ruta.tipo === "producto";
  // Anuncia su alto (0 en computador, donde está oculta). Se repite al cambiar de página: al salir de un producto, su
  // barra de «Agregar» quita la variable y esta la vuelve a poner
  useEffect(() => {
    if (oculta) return;
    const poner = () => document.documentElement.style.setProperty("--barra-abajo", `${barra.current?.offsetHeight ?? 0}px`);
    poner();
    window.addEventListener("resize", poner);
    return () => { window.removeEventListener("resize", poner); document.documentElement.style.removeProperty("--barra-abajo"); };
  }, [oculta, ruta]);
  if (oculta) return null;

  const aqui = (tipo: Ruta["tipo"], extra = true) => ruta.tipo === tipo && extra;
  const buscar = () => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    document.querySelector<HTMLInputElement>("header input")?.focus();
  };
  const item = "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold";
  const color = (activo: boolean) => (activo ? "text-marca" : "text-tinta-2");
  return (
    <>
      {/* Espacio al final de la página para que la barra no tape el pie */}
      <div aria-hidden="true" className="h-[calc(52px+env(safe-area-inset-bottom,0px))] lg:hidden" />
      <nav ref={barra} aria-label="Accesos rápidos"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-superficie/95 pb-[env(safe-area-inset-bottom,0px)] shadow-flota backdrop-blur lg:hidden">
        <ul className="mx-auto flex max-w-pagina">
          <li className="flex flex-1"><a href={hrefDe("inicio")} aria-current={aqui("inicio", !("ancla" in ruta && ruta.ancla)) ? "page" : undefined} className={`${item} ${color(aqui("inicio", !("ancla" in ruta && ruta.ancla)))}`}><IconoCasa className="h-[22px] w-[22px]" />Inicio</a></li>
          <li className="flex flex-1"><a href={hrefDe("categorias")} className={`${item} ${color(aqui("tienda") || ("ancla" in ruta && ruta.ancla === "categorias"))}`}><IconoCuadricula className="h-[22px] w-[22px]" />Categorías</a></li>
          <li className="flex flex-1"><button type="button" onClick={buscar} className={`${item} ${color(aqui("buscar"))}`}><IconoBuscar className="h-[22px] w-[22px]" />Buscar</button></li>
          <li className="flex flex-1"><a href={hrefDe("favoritos")} aria-current={aqui("favoritos") ? "page" : undefined} className={`${item} ${color(aqui("favoritos"))}`}><IconoCorazon />Favoritos</a></li>
          <li className="flex flex-1">
            <button type="button" onClick={abrirCarrito} className={`${item} relative text-tinta-2`}>
              <span className="relative">
                <IconoBolsa className="h-[22px] w-[22px]" />
                {unidades > 0 && <span className="absolute -right-2.5 -top-1.5 min-w-[18px] rounded-full bg-acento px-1 text-center text-[10.5px] font-bold leading-[18px] text-acento-tinta tabular-nums">{unidades}</span>}
              </span>
              Carrito<span className="sr-only">: {unidades} {unidades === 1 ? "producto" : "productos"}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
