import { etiquetaDe } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { dinero } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import type { Producto } from "../types";
import { FotoProducto } from "./FotoProducto";

/** Etiqueta del estado cuando no es nuevo (CPO, Usado, Open box) */
export function Insignia({ producto }: { producto: Producto }) {
  if (producto.estado === "Nuevo") return null;
  return <span className="absolute left-2 top-2 rounded-sm bg-tinta px-1.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-white">{producto.estado}</span>;
}

export function TextoAgregar({ cantidad, tope }: { cantidad: number; tope: boolean }) {
  return <>{tope ? "Sin más unidades" : cantidad ? "Agregar otra" : "Agregar"}</>;
}

/** `cinta`: etiqueta opcional arriba a la derecha de la foto (ej.: "Top ventas") */
export function TarjetaProducto({ producto: p, prioridad = false, cinta }: { producto: Producto; prioridad?: boolean; cinta?: string }) {
  const { version, elegirVersion, cantidadDe, agregar, avisar } = useTienda();
  const i = Math.min(version(p.id), p.opciones.length - 1);
  const o = p.opciones[i] ?? p.opciones[0]!;
  const q = cantidadDe(p.id, i);
  const tope = p.stock != null && q >= p.stock;

  const alAgregar = () => {
    if (agregar(p.id, i)) avisar(`Agregaste ${p.nombre}${o.nombre ? ` (${o.nombre})` : ""} al carrito`);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-linea bg-white transition-colors hover:border-linea-fuerte">
      <a href={hrefProducto(p.id)} tabIndex={-1} aria-hidden="true" className="relative block aspect-square bg-white p-4">
        <FotoProducto producto={p} alt="" prioridad={prioridad} className="transition-transform duration-300 group-hover:scale-[1.02]" />
        <Insignia producto={p} />
        {cinta && <span className="absolute right-2 top-2 rounded-sm bg-acento px-1.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wide text-tinta">{cinta}</span>}
      </a>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-linea/70 p-3.5 sm:p-4">
        <p className="etiqueta-mono truncate">{etiquetaDe(p) || " "}</p>
        <h3 className="font-sans text-[15px] font-semibold leading-snug tracking-normal">
          <a href={hrefProducto(p.id)} className="line-clamp-2 hover:text-marca">{p.nombre}</a>
        </h3>
        {p.specs.length > 0 && <p className="line-clamp-1 text-[13px] text-tinta-2">{p.specs.join(" · ")}</p>}
        {p.nota && <p className="text-[13px] font-semibold text-acento-hover">{p.nota}</p>}
        <div className="mt-auto pt-2">
          {p.opciones.length > 1 && (
            <label className="mb-2 block">
              <span className="sr-only">{p.etiqueta || "Versión"} de {p.nombre}</span>
              <select value={i} onChange={e => elegirVersion(p.id, Number(e.target.value))}
                className="w-full truncate rounded border border-linea bg-fondo px-2 py-1.5 text-[13px] text-tinta focus:border-marca focus:outline-none">
                {p.opciones.map((op, j) => <option key={j} value={j}>{op.nombre} · {dinero(op.precio)}</option>)}
              </select>
            </label>
          )}
          {/* Precio arriba y botón a lo ancho: en celular las tarjetas miden ~165 px y no caben lado a lado */}
          <p className="font-display text-[19px] font-bold leading-none tracking-tight">{dinero(o.precio)}</p>
          <button type="button" onClick={alAgregar} disabled={tope} className="btn btn-sm btn-primario mt-3 w-full">
            <TextoAgregar cantidad={q} tope={tope} />
          </button>
          <p className="mt-1.5 h-4 text-xs font-semibold text-marca" aria-live="polite">{q > 0 ? `${q} en el carrito` : ""}</p>
        </div>
      </div>
    </article>
  );
}
