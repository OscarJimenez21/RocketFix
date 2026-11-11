import { useRef, type ReactNode } from "react";
import type { Producto } from "../types";
import { IconoFlecha } from "./Iconos";
import { TarjetaProducto } from "./TarjetaProducto";

/** Flecha de los botones redondos: con el mouse encima se corre un poco hacia donde lleva (el botón debe tener `group`) */
export const FlechaMovil = ({ dir = 1 }: { dir?: 1 | -1 }) => (
  <IconoFlecha dir={dir} className={`h-5 w-5 transition-transform duration-200 ease-salida ${dir < 0 ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"}`} />
);

/** Fila de productos que se desliza de lado (con el dedo, la rueda o las flechas). No avanza sola.
    `encabezado` va a la izquierda de las flechas; `cinta` se muestra sobre la foto de cada tarjeta.
    `verTodo` (idea 9): al final de la fila, una tarjeta más que lleva a la sección completa. */
export function FilaProductos({ productos, etiqueta, encabezado, cinta, verTodo }: { productos: Producto[]; etiqueta: string; encabezado?: ReactNode; cinta?: string; verTodo?: { href: string; texto: string } }) {
  const fila = useRef<HTMLUListElement>(null);
  const mover = (dir: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    const tarjeta = el.querySelector("li");
    el.scrollBy({ left: dir * ((tarjeta?.getBoundingClientRect().width ?? 260) + 16) * 2, behavior: "smooth" });
  };
  // text-tinta: la flecha es oscura aunque la fila vaya sobre un fondo oscuro (la de regalos, en diciembre)
  const flecha = "presionable group flex h-10 w-10 items-center justify-center rounded-full border border-linea-fuerte bg-superficie text-tinta hover:border-tinta-2";
  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">{encabezado}</div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => mover(-1)} aria-label="Ver productos anteriores" className={flecha}><FlechaMovil dir={-1} /></button>
          <button type="button" onClick={() => mover(1)} aria-label="Ver productos siguientes" className={flecha}><FlechaMovil /></button>
        </div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- una fila que se desliza debe poder enfocarse para moverla con las flechas del teclado */}
      <ul ref={fila} aria-label={etiqueta} tabIndex={0}
        className="sin-barra -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {productos.map(p => (
          <li key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(20%-13px)]"><TarjetaProducto producto={p} cinta={cinta} /></li>
        ))}
        {verTodo && (
          <li className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(20%-13px)]">
            <a href={verTodo.href} className="tarjeta group flex h-full min-h-[260px] flex-col items-center justify-center gap-3 border-dashed p-4 text-center font-semibold text-marca-texto hover:border-marca">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marca-suave"><FlechaMovil /></span>
              {verTodo.texto}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
