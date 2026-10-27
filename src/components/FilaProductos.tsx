import { useRef } from "react";
import type { Producto } from "../types";
import { IconoFlecha } from "./Iconos";
import { TarjetaProducto } from "./TarjetaProducto";

/** Fila de productos que se desliza de lado (con el dedo, la rueda o las flechas). No avanza sola. */
export function FilaProductos({ productos, etiqueta }: { productos: Producto[]; etiqueta: string }) {
  const fila = useRef<HTMLUListElement>(null);
  const mover = (dir: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    const tarjeta = el.querySelector("li");
    el.scrollBy({ left: dir * ((tarjeta?.getBoundingClientRect().width ?? 260) + 16) * 2, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <ul ref={fila} aria-label={etiqueta} tabIndex={0}
        className="sin-barra -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {productos.map(p => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(20%-13px)]"><TarjetaProducto producto={p} /></li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => mover(-1)} aria-label="Ver productos anteriores" className="flex h-10 w-10 items-center justify-center rounded border border-linea-fuerte bg-white hover:border-tinta-2"><IconoFlecha dir={-1} /></button>
        <button type="button" onClick={() => mover(1)} aria-label="Ver productos siguientes" className="flex h-10 w-10 items-center justify-center rounded border border-linea-fuerte bg-white hover:border-tinta-2"><IconoFlecha /></button>
      </div>
    </div>
  );
}
