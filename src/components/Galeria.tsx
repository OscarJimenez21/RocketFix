/* Fotos de la página del producto: foto principal y las de su galería. Se pasan con las flechas, deslizando o con las miniaturas.
   Con una sola foto no hay carrusel. Una foto extra que no carga se quita. */
import { useEffect, useRef, useState } from "react";
import { galeriaDe } from "../data/catalogo";
import { recurso } from "../lib/formato";
import type { Producto } from "../types";
import { FotoProducto } from "./FotoProducto";
import { IconoFlecha } from "./Iconos";
import { Insignia } from "./TarjetaProducto";

export function Galeria({ producto }: { producto: Producto }) {
  const [fotos, setFotos] = useState(() => galeriaDe(producto));
  const [actual, setActual] = useState(0);
  const pista = useRef<HTMLDivElement>(null);
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
      <div className="relative aspect-square rounded-md border border-linea bg-white p-6">
        <FotoProducto producto={producto} prioridad />
        <Insignia producto={producto} />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-md border border-linea bg-white">
        <div ref={pista} onScroll={alDeslizar} tabIndex={0} role="group" aria-roledescription="carrusel" aria-label={`Fotos de ${producto.nombre}`}
          className="sin-barra flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {fotos.map((f, i) => (
            <div key={f} className="h-full w-full shrink-0 snap-center p-6">
              <img src={recurso(f)} alt={`${producto.nombre}, foto ${i + 1} de ${fotos.length}`} width={800} height={800}
                loading={i ? "lazy" : "eager"} decoding="async" className="h-full w-full object-contain"
                onError={() => i > 0 && setFotos(fs => fs.filter(x => x !== f))} />
            </div>
          ))}
        </div>
        <Insignia producto={producto} />
        <button type="button" onClick={() => ir(actual - 1)} disabled={actual <= 0} aria-label="Foto anterior"
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-white/95 disabled:opacity-0"><IconoFlecha dir={-1} /></button>
        <button type="button" onClick={() => ir(actual + 1)} disabled={actual >= fotos.length - 1} aria-label="Foto siguiente"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-linea bg-white/95 disabled:opacity-0"><IconoFlecha /></button>
        <span className="absolute bottom-2 right-2 rounded-sm bg-tinta/75 px-2 py-0.5 font-mono text-xs text-white" aria-hidden="true">{actual + 1} / {fotos.length}</span>
      </div>
      <div className="sin-barra mt-3 flex gap-2 overflow-x-auto pb-1">
        {fotos.map((f, i) => (
          <button key={f} type="button" onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === actual || undefined}
            className={`h-16 w-16 shrink-0 rounded border bg-white p-1 ${i === actual ? "border-marca ring-1 ring-marca" : "border-linea hover:border-linea-fuerte"}`}>
            <img src={recurso(f)} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
