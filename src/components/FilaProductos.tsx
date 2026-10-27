import { useRef, type ReactNode } from "react";
import type { Producto } from "../types";
import { IconoFlecha } from "./Iconos";
import { TarjetaProducto } from "./TarjetaProducto";

/** Fila de productos que se desliza de lado (con el dedo, la rueda o las flechas). No avanza sola.
    `encabezado` va a la izquierda de las flechas; `cinta` se muestra sobre la foto de cada tarjeta. */
export function FilaProductos({ productos, etiqueta, encabezado, cinta }: { productos: Producto[]; etiqueta: string; encabezado?: ReactNode; cinta?: string }) {
  const fila = useRef<HTMLUListElement>(null);
  const mover = (dir: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    const tarjeta = el.querySelector("li");
    el.scrollBy({ left: dir * ((tarjeta?.getBoundingClientRect().width ?? 260) + 16) * 2, behavior: "smooth" });
  };
  const flecha = "flex h-10 w-10 items-center justify-center rounded-full border border-linea-fuerte bg-white transition-colors hover:border-tinta-2";
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">{encabezado}</div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => mover(-1)} aria-label="Ver productos anteriores" className={flecha}><IconoFlecha dir={-1} /></button>
          <button type="button" onClick={() => mover(1)} aria-label="Ver productos siguientes" className={flecha}><IconoFlecha /></button>
        </div>
      </div>
      <ul ref={fila} aria-label={etiqueta} tabIndex={0}
        className="sin-barra -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {productos.map(p => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(20%-13px)]"><TarjetaProducto producto={p} cinta={cinta} /></li>
        ))}
      </ul>
    </div>
  );
}
