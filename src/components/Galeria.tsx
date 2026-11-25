/* Fotos de la página del producto: foto principal y las de su galería. Se pasan con las flechas, deslizando o con las miniaturas.
   Con una sola foto no hay carrusel. Una foto extra que no carga se quita. */
import { useEffect, useRef, useState } from "react";
import { useGaleria } from "../lib/galerias";
import { recurso, srcsetFoto } from "../lib/formato";
import { useMarco } from "../lib/movimiento";
import type { Producto } from "../types";
import { FotoProducto, Imagen } from "./FotoProducto";
import { IconoAmpliar, IconoFlecha } from "./Iconos";
import { Insignia } from "./TarjetaProducto";
import { Visor } from "./Visor";
import { suave } from "../lib/animaciones";

/** Animación 49: brillo suave del color de la versión elegida en el borde de la foto (encima de la foto, sin tocarla) */
function Tinte({ color }: { color: string | null }) {
  return <span aria-hidden="true" className="tinte-version" style={color ? ({ "--tinte": color } as React.CSSProperties) : undefined} data-on={color ? "" : undefined} />;
}

export function Galeria({ producto, tinte = null }: { producto: Producto; tinte?: string | null }) {
  // Las fotos extra llegan aparte (lib/galerias.ts): mientras tanto se ve la principal
  const todas = useGaleria(producto);
  const clave = todas.join("|");
  const [fotos, setFotos] = useState(todas);
  const [actual, setActual] = useState(0);
  const pista = useRef<HTMLDivElement>(null);
  const tira = useRef<HTMLDivElement>(null);
  const marco = useMarco(tira, actual);
  // Otro producto: vuelve a la primera foto. Llegaron fotos nuevas: se usan. Se ajusta al dibujar, sin efectos aparte
  const [antes, setAntes] = useState({ producto, clave });
  if (antes.producto !== producto || antes.clave !== clave) {
    if (antes.producto !== producto) setActual(0);
    if (antes.clave !== clave) setFotos(clave ? clave.split("|") : []);
    setAntes({ producto, clave });
  }
  useEffect(() => { pista.current?.scrollTo({ left: 0 }); }, [producto]);
  useEffect(() => {
    const fila = tira.current;
    const el = fila?.children[actual] as HTMLElement | undefined;
    if (!fila || !el || fila.scrollWidth <= fila.clientWidth) return;
    if (el.offsetLeft < fila.scrollLeft || el.offsetLeft + el.offsetWidth > fila.scrollLeft + fila.clientWidth)
      fila.scrollTo({ left: el.offsetLeft - 8, behavior: suave() });
  }, [actual]);

  const ir = (i: number) => {
    const el = pista.current;
    if (!el) return;
    const k = Math.max(0, Math.min(fotos.length - 1, i));
    el.scrollTo({ left: k * el.clientWidth, behavior: suave() });
  };
  const alDeslizar = () => {
    const el = pista.current;
    if (el) setActual(Math.round(el.scrollLeft / (el.clientWidth || 1)));
  };
  // 25/11/2026: se quitó la lupa al pasar el mouse (animación 17); para ver de cerca está el visor (clic o «Ampliar»)

  // Idea 11: visor a pantalla completa (se monta solo al abrirlo)
  const [visor, setVisor] = useState(false);
  const ampliar = fotos.length > 0 && (
    <button type="button" onClick={() => setVisor(true)} aria-label="Ver las fotos en grande" title="Ampliar"
      className="presionable claro-siempre absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-linea bg-white/95 text-tinta-2 hover:border-linea-fuerte hover:text-tinta">
      <IconoAmpliar />
    </button>
  );
  const visorAbierto = visor && <Visor fotos={fotos} inicial={actual} nombre={producto.nombre} cerrar={() => setVisor(false)} />;

  if (fotos.length < 2) {
    return (
      <div data-foto-principal className="escenario relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-md border border-linea p-4 sm:aspect-square sm:p-6">
        {/* Mejora: tocar la foto la abre en grande (el botón «Ampliar» sigue siendo el camino con teclado) */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- atajo con el mouse o el dedo; el botón «Ampliar» hace lo mismo con el teclado */}
        <div className="h-full w-full" onClick={() => fotos.length > 0 && setVisor(true)}><FotoProducto producto={producto} prioridad /></div>
        <Tinte color={tinte} />
        <Insignia producto={producto} />
        {ampliar}
        {visorAbierto}
      </div>
    );
  }

  return (
    <div>
      {visorAbierto}
      {/* data-foto-principal: de aquí despega la foto hacia el carrito al agregar */}
      <div data-foto-principal className="escenario relative aspect-[4/3] overflow-hidden rounded-md border border-linea sm:aspect-square">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- las fotos se deslizan: deben poder enfocarse para pasarlas con las flechas del teclado (Inicio/Fin incluidos); el clic es un atajo para ampliar, que el botón «Ampliar» también ofrece */}
        <div ref={pista} onScroll={alDeslizar} tabIndex={0} role="group" aria-roledescription="carrusel" aria-label={`Fotos de ${producto.nombre}`}
          // Mejora: Inicio y Fin van a la primera y a la última foto
          onKeyDown={e => { if (e.key === "Home") { e.preventDefault(); ir(0); } else if (e.key === "End") { e.preventDefault(); ir(fotos.length - 1); } }}
          // Mejora: tocar la foto la abre en grande (deslizar sigue pasando de foto: el navegador no cuenta el deslizamiento como clic)
          onClick={() => setVisor(true)}
          className="sin-barra flex h-full cursor-zoom-in snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {fotos.map((f, i) => (
            <div key={f} className="h-full w-full shrink-0 snap-center p-4 sm:p-6">
              {/* La primera ya la pidió el HTML en su tamaño original; las demás traen copias livianas para pantallas pequeñas */}
              <Imagen src={recurso(f)} alt={`${producto.nombre}, foto ${i + 1} de ${fotos.length}`} width={800} height={800}
                {...(i > 0 ? { srcSet: srcsetFoto(f), sizes: "(min-width: 1024px) 560px, 100vw" } : null)}
                prioridad={i === 0} className="h-full w-full object-contain"
                onError={() => i > 0 && setFotos(fs => fs.filter(x => x !== f))} />
            </div>
          ))}
        </div>
        <Tinte color={tinte} />
        <Insignia producto={producto} />
        {ampliar}
        <button type="button" onClick={() => ir(actual - 1)} disabled={actual <= 0} aria-label="Foto anterior"
          className="presionable group absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center claro-siempre rounded-full border border-linea bg-white/95 hover:border-linea-fuerte disabled:opacity-0">
          <IconoFlecha dir={-1} className="h-5 w-5 transition-transform duration-200 ease-salida group-hover:-translate-x-0.5" /></button>
        <button type="button" onClick={() => ir(actual + 1)} disabled={actual >= fotos.length - 1} aria-label="Foto siguiente"
          className="presionable group absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center claro-siempre rounded-full border border-linea bg-white/95 hover:border-linea-fuerte disabled:opacity-0">
          <IconoFlecha className="h-5 w-5 transition-transform duration-200 ease-salida group-hover:translate-x-0.5" /></button>
        <span className="absolute bottom-2 right-2 overflow-hidden rounded-sm bg-oscuro/75 px-2 py-0.5 font-mono text-xs text-white" aria-hidden="true"><span key={actual} className="contador-foto inline-block">{actual + 1}</span> / {fotos.length}</span>
      </div>
      {/* Al pasar de foto, el marco verde se desliza de una miniatura a la otra (va encima de las miniaturas, solo es el borde).
          19/11/2026: en celular no hay miniaturas (se desliza la foto y el contador dice cuántas hay), y la foto es más baja
          (4:3), para que el nombre y el precio suban a la primera pantalla */}
      <div ref={tira} className="sin-barra mt-3 hidden gap-2 overflow-x-auto pb-1 pt-px sm:flex">
        {fotos.map((f, i) => (
          <button key={f} data-opcion type="button" onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`} aria-current={i === actual || undefined}
            className={`presionable escenario h-16 w-16 shrink-0 rounded border p-1 ${i === actual && !marco ? "border-marca ring-1 ring-marca" : "border-linea hover:border-linea-fuerte"}`}>
            <Imagen src={recurso(f)} srcSet={srcsetFoto(f)} sizes="64px" alt="" className={`miniatura h-full w-full object-contain ${i === actual ? "elegida" : ""}`} />
          </button>
        ))}
        {marco && <span aria-hidden="true" className="pointer-events-none absolute left-0 top-0 rounded border border-marca ring-1 ring-marca" style={marco} />}
      </div>
    </div>
  );
}
