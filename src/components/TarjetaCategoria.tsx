/* 25/11/2026: tipo de producto o sección como en la tienda de Apple: la foto de uno de sus productos, el nombre y cuántos hay.
   Se usa en las páginas de categoría (Tienda.tsx) y de marca (Marca.tsx). Sin foto, un ícono de cuadrícula («Todo») */
import { recurso } from "../lib/formato";
import { IconoCuadricula } from "./Iconos";

export function TarjetaCategoria({ activo, onClick, nombre, n, foto }: { activo: boolean; onClick: () => void; nombre: string; n: number; foto?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo}
      className={`presionable group flex w-[118px] shrink-0 flex-col items-center rounded-2xl px-2 pb-3 pt-2 text-center transition-colors sm:w-[132px] ${activo ? "bg-marca-suave ring-2 ring-inset ring-marca" : "hover:bg-fondo"}`}>
      <span className="escenario flex h-[84px] w-[84px] items-center justify-center rounded-2xl bg-white sm:h-[96px] sm:w-[96px]">
        {foto ? <img src={recurso(foto)} alt="" loading="lazy" decoding="async" width={96} height={96} className="h-full w-full object-contain p-1.5 transition-transform duration-300 ease-salida group-hover:scale-105" />
          : <IconoCuadricula className="h-9 w-9 text-marca" />}
      </span>
      <span className={`mt-2 line-clamp-2 text-[13.5px] font-semibold leading-tight ${activo ? "text-marca" : "text-tinta"}`}>{nombre}</span>
      <span className="mt-0.5 text-[12px] tabular-nums text-tinta-3">{n}</span>
    </button>
  );
}
