/* Fotos de la página del producto: foto principal y las de su galería. Se pasan con las flechas, deslizando o con las miniaturas.
   Con una sola foto no hay carrusel. Una foto extra que no carga se quita. */
import { useEffect, useRef, useState } from "react";
import { galeriaDe } from "../data/catalogo";
import { recurso } from "../lib/formato";
import { useMarco } from "../lib/movimiento";
import type { Producto } from "../types";
import { FotoProducto, Imagen } from "./FotoProducto";
import { IconoFlecha } from "./Iconos";
import { Insignia } from "./TarjetaProducto";

export function Galeria({ producto }: { producto: Producto }) {
  const [fotos, setFotos] = useState(() => galeriaDe(producto));
  const [actual, setActual] = useState(0);
  const pista = useRef<HTMLDivElement>(null);
  const tira = useRef<HTMLDivElement>(null);
  const marco = useMarco(tira, actual);
  useEffect(() => { setFotos(galeriaDe(producto)); setActual(0); pista.current?.scrollTo({ left: 0 }); }, [producto]);

  const ir = (i: number) => {
    const el = pista.current;
    if (!el) return;
    const k = Math.max(0, Math.min(fotos.length - 1, i));
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
  };
  const alDeslizar = () => {
    const el = pista.current;
    if (el) setActual(Math.round(el.scrollLeft / (el.clientWidth || 1)));
  };

  if (fotos.length < 2) {
    return (
      <div data-foto-principal className="relative aspect-square rounded-md border border-linea bg-white p-6">
        <FotoProducto producto={producto} prioridad />
        <Insignia producto={producto} />
      </div>
    );
  }

  return (
    <div>
      {/* data-foto-principal: de aquí despega la foto hacia el carrito al agregar */}
      <div data-foto-principal className="relative aspect-square overflow-hidden rounded-md border border-linea bg-white">
        <div ref={pista} onScroll={alDeslizar} tabIndex={0} role="group" aria-roledescription="carrusel" aria-label={`Fotos de ${producto.nombre}`}
          className="sin-barra flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {fotos.map((f, i) => (
            <div key={f} className="h-full w-full shrink-0 snap-center p-6">
              <Imagen src={recurso(f)} alt={`${producto.nombre}, foto ${i + 1} de ${fotos.length}`} width={800} height={800}
                prioridad={i === 0} className="h-full w-full object-contain"
                onError={() => i > 0 && setFotos(fs => fs.filter(x => x !== f))} />
            </div>
          ))}
        </div>
        <Insignia producto={producto} />
        <button type="button" onClick={() => ir(actual - 1)} disabled={actual <= 0} aria-label="Foto anterior"
          className="presionable group absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-white/95 hover:border-linea-fuerte disabled:opacity-0">
          <IconoFlecha dir={-1} className="h-5 w-5 transition-transform duration-200 ease-salida group-hover:-translate-x-0.5" /></button>
        <button type="button" onClick={() => ir(actual + 1)} disabled={actual >= fotos.length - 1} aria-label="Foto siguiente"
          className="presionable group absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-white/95 hover:border-linea-fuerte disabled:opacity-0">
          <IconoFlecha className="h-5 w-5 transition-transform duration-200 ease-salida group-hover:translate-x-0.5" /></button>
        <span className="absolute bottom-2 right-2 rounded-sm bg-tinta/75 px-2 py-0.5 font-mono text-xs text-white" aria-hidden="true">{actual + 1} / {fotos.length}</span>
      </div>
      {/* Al pasar de foto, el marco verde se desliza de una miniatura a la otra (va encima de las miniaturas, solo es el borde) */}
      <div ref={tira} className="sin-barra mt-3 flex gap-2 overflow-x-auto pb-1 pt-px">
        {fotos.map((f, i) => (
          <button key={f} data-opcion type="button" onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === actual || undefined}
            className={`presionable h-16 w-16 shrink-0 rounded border bg-white p-1 ${i === actual && !marco ? "border-marca ring-1 ring-marca" : "border-linea hover:border-linea-fuerte"}`}>
            <Imagen src={recurso(f)} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
        {marco && <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded border border-marca ring-1 ring-marca" style={marco} />}
      </div>
    </div>
  );
}
