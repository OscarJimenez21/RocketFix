/* Idea 11: visor de fotos a pantalla completa. Se abre con el botón «Ampliar» de la foto del producto.
   - Tocar o hacer clic en la foto la acerca (2,5×) en ese punto; otro toque la aleja.
   - Acercada: con el mouse se recorre moviéndolo; con el dedo, arrastrando.
   - Flechas (en pantalla o del teclado) para pasar de foto; Esc o la X para cerrar. El fondo queda bloqueado mientras está abierto */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { recurso } from "../lib/formato";
import { usePanelModal } from "../lib/panel";
import { IconoCerrar, IconoFlecha } from "./Iconos";

const ZOOM = 2.5;

export function Visor({ fotos, inicial, nombre, cerrar }: { fotos: string[]; inicial: number; nombre: string; cerrar: () => void }) {
  const [i, setI] = useState(inicial);
  const [cerca, setCerca] = useState(false);
  const [punto, setPunto] = useState({ x: 50, y: 50 });
  const panel = useRef<HTMLDivElement>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);
  const arrastre = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  usePanelModal(true, cerrar, panel, botonCerrar);

  const pasar = (d: number) => { setCerca(false); setI(n => (n + d + fotos.length) % fotos.length); };
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (fotos.length < 2) return;
      if (e.key === "ArrowRight") pasar(1);
      else if (e.key === "ArrowLeft") pasar(-1);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pasar solo usa el largo de la lista
  }, [fotos.length]);

  const enPorcentaje = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)) };
  };
  const alBajar = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (cerca && e.pointerType !== "mouse") arrastre.current = { x: e.clientX, y: e.clientY, px: punto.x, py: punto.y };
  };
  const alMover = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!cerca) return;
    if (e.pointerType === "mouse") { setPunto(enPorcentaje(e)); return; }
    const a = arrastre.current;
    if (!a) return;
    const r = e.currentTarget.getBoundingClientRect();
    // Arrastrar hacia la derecha muestra lo que está a la izquierda (como mover una hoja con el dedo)
    setPunto({ x: Math.min(100, Math.max(0, a.px - ((e.clientX - a.x) / r.width) * 100 * (ZOOM / (ZOOM - 1)))),
      y: Math.min(100, Math.max(0, a.py - ((e.clientY - a.y) / r.height) * 100 * (ZOOM / (ZOOM - 1)))) });
  };
  const alSoltar = (e: React.PointerEvent<HTMLButtonElement>) => {
    const a = arrastre.current;
    arrastre.current = null;
    // Si el dedo se movió, fue un arrastre y no un toque: la foto sigue acercada
    if (a && Math.hypot(e.clientX - a.x, e.clientY - a.y) > 8) return;
    if (cerca) setCerca(false);
    else { setPunto(enPorcentaje(e)); setCerca(true); }
  };

  const foto = fotos[i] ?? fotos[0] ?? "";
  // Va directo en <body>: dentro de la foto (que recorta lo que sobresale) no podría cubrir la pantalla
  return createPortal(
    <div ref={panel} role="dialog" aria-modal="true" aria-label={`Fotos de ${nombre}`}
      className="fixed inset-0 z-[60] flex flex-col bg-oscuro/95 text-white motion-safe:animate-entrar">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <p className="min-w-0 truncate text-sm text-white/80">{nombre}{fotos.length > 1 && <span className="ml-2 tabular-nums text-white/60">{i + 1} / {fotos.length}</span>}</p>
        <button ref={botonCerrar} type="button" onClick={cerrar} aria-label="Cerrar fotos"
          className="presionable flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"><IconoCerrar /></button>
      </div>
      <div className="relative min-h-0 flex-1 px-2 pb-4 sm:px-16">
        <button type="button" aria-label={cerca ? "Alejar la foto" : "Acercar la foto"}
          onPointerDown={alBajar} onPointerMove={alMover} onPointerUp={alSoltar}
          // Con el teclado (Enter o espacio) también acerca y aleja, al centro
          onClick={e => { if (e.detail === 0) { setPunto({ x: 50, y: 50 }); setCerca(c => !c); } }}
          className={`claro-siempre relative h-full w-full overflow-hidden rounded-lg bg-white ${cerca ? "cursor-zoom-out touch-none" : "cursor-zoom-in"}`}>
          <img key={foto} src={recurso(foto)} alt={`${nombre}, foto ${i + 1} de ${fotos.length}`} draggable={false}
            className="h-full w-full select-none object-contain p-4 transition-transform duration-200 ease-salida motion-safe:animate-entrar"
            style={{ transform: cerca ? `scale(${ZOOM})` : undefined, transformOrigin: `${punto.x}% ${punto.y}%` }} />
        </button>
        {fotos.length > 1 && (
          <>
            <button type="button" onClick={() => pasar(-1)} aria-label="Foto anterior"
              className="presionable absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-oscuro/70 text-white hover:bg-oscuro sm:left-3"><IconoFlecha dir={-1} /></button>
            <button type="button" onClick={() => pasar(1)} aria-label="Foto siguiente"
              className="presionable absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-oscuro/70 text-white hover:bg-oscuro sm:right-3"><IconoFlecha /></button>
          </>
        )}
      </div>
      <p className="shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] text-center text-xs text-white/60">{cerca ? "Toca otra vez para alejar" : "Toca la foto para acercarla"}</p>
    </div>,
    document.body
  );
}
