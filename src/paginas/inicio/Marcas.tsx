import { useEffect, useMemo, useRef, useState } from "react";
import { LOGOS_MARCAS, PRODUCTOS } from "../../data/catalogo";
import { FlechaMovil } from "../../components/FilaProductos";
import { useEnPantalla } from "../../lib/enPantalla";
import { recurso } from "../../lib/formato";
import { hrefMarca } from "../../lib/rutas";
import { BotonPausa } from "./BotonPausa";
import { suave } from "../../lib/animaciones";

/** Marcas con 5 productos o más, de la que más tiene a la que menos, con su logo (o su nombre si no hay logo); cada una
    lleva a su página (#marca/…), que muestra solo los productos guardados con esa marca. La fila avanza sola y también se mueve
    a mano: con las flechas, arrastrando con el mouse o deslizando con el dedo; después de moverla espera unos segundos y
    sigue sola. Se detiene con el mouse encima, con el teclado o con su botón de pausa, y no avanza si la persona pidió
    menos movimiento.
    La lista va tres veces seguidas y la fila se mantiene en la del medio: al acercarse a un borde salta una vuelta
    completa, que se ve igual, así que nunca se acaba hacia ningún lado. */
export function Marcas() {
  const marcas = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const p of PRODUCTOS) if (p.marca) cuenta.set(p.marca, (cuenta.get(p.marca) ?? 0) + 1);
    return [...cuenta.entries()].filter(([, n]) => n >= 5).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([m]) => m);
  }, []);
  const fila = useRef<HTMLUListElement>(null);
  const encima = useRef(false);
  const quietaHasta = useRef(0);
  const arrastre = useRef<{ x: number; inicio: number; movio: boolean } | null>(null);
  const bloquearClic = useRef(false);
  // La pausa va en estado (para el botón) y en una referencia (la lee el ciclo de movimiento sin reiniciarlo)
  const [pausada, setPausada] = useState(false);
  const pausa = useRef(false);
  const [reducir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const alternarPausa = () => setPausada(v => { pausa.current = !v; return !v; });

  /** Ancho de una vuelta de la lista (de la primera marca a su copia) */
  const vuelta = () => {
    const li = fila.current?.children;
    return li && li.length > marcas.length ? (li[marcas.length] as HTMLElement).offsetLeft - (li[0] as HTMLElement).offsetLeft : 0;
  };
  /** Mantiene la fila en la copia del medio; devuelve cuánto saltó */
  const centrar = () => {
    const el = fila.current, v = vuelta();
    if (!el || !v) return 0;
    const salto = el.scrollLeft < v * 0.5 ? v : el.scrollLeft >= v * 1.5 ? -v : 0;
    if (salto) el.scrollLeft += salto;
    return salto;
  };
  const pausar = (ms = 4000) => { quietaHasta.current = performance.now() + ms; };

  // Al cargar, la fila arranca en la copia del medio
  useEffect(() => { if (fila.current) fila.current.scrollLeft = vuelta(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // El movimiento solo corre mientras la fila se ve en pantalla (fuera de ella no gasta batería)
  const visible = useEnPantalla(fila);
  useEffect(() => {
    const el = fila.current;
    if (!el || !visible) return;
    let raf = 0, antes = performance.now(), pos = el.scrollLeft;
    const paso = (t: number) => {
      const dt = Math.min(t - antes, 64); antes = t;
      if (reducir || pausa.current || encima.current || arrastre.current || t < quietaHasta.current) pos = el.scrollLeft;
      else { pos += dt * 0.05; el.scrollLeft = pos; }
      const salto = centrar();
      pos += salto;
      if (arrastre.current) arrastre.current.inicio += salto;
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const mover = (dir: 1 | -1) => {
    const el = fila.current, v = vuelta();
    if (!el) return;
    const paso = dir * Math.max(el.clientWidth * 0.6, 220);
    // Si el destino queda fuera de la copia del medio, primero se salta una vuelta (se ve igual) y luego se desliza
    if (v && el.scrollLeft + paso < v * 0.5) el.scrollLeft += v;
    else if (v && el.scrollLeft + paso >= v * 1.5) el.scrollLeft -= v;
    pausar(5000);
    el.scrollBy({ left: paso, behavior: suave() });
  };
  // Arrastrar con el mouse (con el dedo la fila se desliza sola, como cualquier lista)
  const bajar = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !fila.current) return;
    arrastre.current = { x: e.clientX, inicio: fila.current.scrollLeft, movio: false };
  };
  const arrastrar = (e: React.PointerEvent) => {
    const a = arrastre.current, el = fila.current;
    if (!a || !el) return;
    const dx = e.clientX - a.x;
    if (!a.movio && Math.abs(dx) > 5) { a.movio = true; el.setPointerCapture(e.pointerId); }
    if (a.movio) el.scrollLeft = a.inicio - dx;
  };
  const soltar = () => {
    const a = arrastre.current;
    arrastre.current = null;
    if (a?.movio) { bloquearClic.current = true; window.setTimeout(() => { bloquearClic.current = false; }, 80); pausar(); }
  };

  const flecha = "presionable group flex h-11 w-11 items-center justify-center rounded-full border border-linea-fuerte bg-superficie hover:border-tinta-2";
  return (
    <section id="marcas" aria-labelledby="t-marcas" className="overflow-hidden border-b border-linea py-9">
      <div className="contenedor flex items-end justify-between gap-4">
        <h2 id="t-marcas" className="titulo-seccion titulo-trazo min-w-0">Las marcas que buscas</h2>
        <div className="flex shrink-0 gap-2">
          {!reducir && <BotonPausa pausado={pausada} alternar={alternarPausa} que="la fila de marcas" className={`${flecha} text-tinta-2`} />}
          <button type="button" onClick={() => mover(-1)} aria-label="Ver marcas anteriores" className={flecha}><FlechaMovil dir={-1} /></button>
          <button type="button" onClick={() => mover(1)} aria-label="Ver más marcas" className={flecha}><FlechaMovil /></button>
        </div>
      </div>
      <ul ref={fila} aria-label="Marcas"
        onMouseEnter={() => { encima.current = true; }} onMouseLeave={() => { encima.current = false; soltar(); }}
        onFocus={() => { encima.current = true; }} onBlur={() => { encima.current = false; }}
        onTouchStart={() => pausar(8000)} onTouchEnd={() => pausar()} onWheel={() => pausar()}
        onPointerDown={bajar} onPointerMove={arrastrar} onPointerUp={soltar} onPointerCancel={soltar}
        onClickCapture={e => { if (bloquearClic.current) { e.preventDefault(); e.stopPropagation(); } }}
        onDragStart={e => e.preventDefault()}
        className="sin-barra mt-5 flex cursor-grab select-none gap-3 overflow-x-auto px-4 py-1 active:cursor-grabbing sm:px-6">
        {[...marcas, ...marcas, ...marcas].map((m, i) => {
          const copia = i < marcas.length || i >= marcas.length * 2;
          return (
            <li key={`${m}-${i}`} aria-hidden={copia || undefined} className="shrink-0">
              {/* marca-eleva: animación 35 (el py-1 de la fila le deja espacio para subir sin recortarse) */}
              <a href={hrefMarca(m)} tabIndex={copia ? -1 : undefined} draggable={false}
                className="marca-eleva marca-logo claro-siempre flex h-14 w-36 items-center justify-center whitespace-nowrap rounded-lg border border-linea bg-white px-4 font-display text-lg font-extrabold tracking-tight text-tinta-2 transition-colors ancho-108 hover:border-marca hover:text-marca">
                {LOGOS_MARCAS[m]
                  ? <img src={recurso(LOGOS_MARCAS[m])} alt={m} draggable={false} loading="lazy" decoding="async" className="logo-gris max-h-7 max-w-full object-contain" />
                  : m}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
