/* Idea 11: visor de fotos a pantalla completa. Se abre con el botón «Ampliar» de la foto del producto.
   - Tocar o hacer clic en la foto la acerca (2,5×) en ese punto; otro toque la aleja.
   - Acercada: con el mouse se recorre moviéndolo; con el dedo, arrastrando.
   - Flechas (en pantalla o del teclado) para pasar de foto; Esc o la X para cerrar. El fondo queda bloqueado mientras está abierto */
import { useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
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
  const arrastre = useRef<{ x: number; y: number; px: number; py: number; t: number } | null>(null);
  usePanelModal(true, cerrar, panel, botonCerrar);

  // 21/11/2026: al pasar de foto, la actual se desliza hacia un lado y la nueva entra por el otro (antes cambiaba de golpe).
  // Con el dedo, la foto sigue al dedo mientras se arrastra. Con «reducir movimiento» del teléfono, cambia sin deslizar.
  const caja = useRef<HTMLButtonElement>(null);
  const [x, setX] = useState(0);
  const [transicion, setTransicion] = useState("none");
  const ocupado = useRef(false);
  const pasar = (d: number) => {
    setCerca(false);
    const w = caja.current?.clientWidth ?? 0;
    if (!w || matchMedia("(prefers-reduced-motion: reduce)").matches) { setX(0); setI(n => (n + d + fotos.length) % fotos.length); return; }
    if (ocupado.current) return;
    ocupado.current = true;
    setTransicion("transform 170ms cubic-bezier(0.4, 0, 1, 1)"); setX(-d * w);
    window.setTimeout(() => {
      // La nueva se pone al otro lado sin animar, se obliga al navegador a ubicarla y luego entra deslizándose
      flushSync(() => { setTransicion("none"); setI(n => (n + d + fotos.length) % fotos.length); setX(d * w); });
      void caja.current?.offsetWidth;
      setTransicion("transform 260ms cubic-bezier(0.23, 1, 0.32, 1)"); setX(0);
      window.setTimeout(() => { ocupado.current = false; }, 260);
    }, 170);
  };
  const volver = () => { setTransicion("transform 220ms cubic-bezier(0.23, 1, 0.32, 1)"); setX(0); };
  // Mejora: con la foto acercada, Esc primero la aleja (otro Esc cierra el visor) y las flechas recorren la foto
  const cercaRef = useRef(cerca);
  useEffect(() => { cercaRef.current = cerca; }, [cerca]);
  useEffect(() => {
    const alejar = (e: KeyboardEvent) => {
      if (!cercaRef.current) return;
      const mover: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setCerca(false); }
      else if (mover[e.key]) {
        e.preventDefault(); e.stopPropagation();
        const [dx, dy] = mover[e.key] ?? [0, 0];
        setPunto(p => ({ x: Math.min(100, Math.max(0, p.x + dx)), y: Math.min(100, Math.max(0, p.y + dy)) }));
      }
    };
    window.addEventListener("keydown", alejar, true);
    return () => window.removeEventListener("keydown", alejar, true);
  }, []);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      // Acercada, las flechas recorren la foto (ver arriba) en vez de pasar a otra
      if (fotos.length < 2 || cercaRef.current) return;
      if (e.key === "ArrowRight") pasar(1);
      else if (e.key === "ArrowLeft") pasar(-1);
      // Mejora: Inicio y Fin van a la primera y a la última foto
      else if (e.key === "Home") { setCerca(false); setI(0); }
      else if (e.key === "End") { setCerca(false); setI(fotos.length - 1); }
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
    // Con el dedo se anota dónde empezó: acercada, para recorrerla; alejada, para pasar de foto deslizando
    if (e.pointerType !== "mouse" && !ocupado.current) arrastre.current = { x: e.clientX, y: e.clientY, px: punto.x, py: punto.y, t: performance.now() };
  };
  const alMover = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!cerca) {
      // Alejada: la foto sigue al dedo de lado a lado
      const a = arrastre.current;
      if (a && fotos.length > 1) { const dx = e.clientX - a.x; if (Math.abs(dx) > Math.abs(e.clientY - a.y)) { setTransicion("none"); setX(dx); } }
      return;
    }
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
    // Mejora: con la foto alejada, deslizar el dedo a un lado pasa a la foto siguiente o a la anterior
    if (a && !cerca && fotos.length > 1) {
      const dx = e.clientX - a.x;
      // Pasa si el dedo recorrió más de 50 px o si fue un toque rápido hacia un lado
      const rapido = Math.abs(dx) / Math.max(1, performance.now() - a.t) > 0.11 && Math.abs(dx) > 20;
      if ((Math.abs(dx) > 50 || rapido) && Math.abs(dx) > Math.abs(e.clientY - a.y)) { pasar(dx < 0 ? 1 : -1); return; }
      if (x !== 0) volver();
    }
    // Si el dedo se movió, fue un arrastre y no un toque: la foto sigue acercada
    if (a && Math.hypot(e.clientX - a.x, e.clientY - a.y) > 8) return;
    if (cerca) setCerca(false);
    else { setPunto(enPorcentaje(e)); setCerca(true); }
  };

  // Mejora: la foto siguiente y la anterior se piden por adelantado, así al pasar ya están listas
  useEffect(() => {
    if (fotos.length < 2) return;
    for (const d of [1, -1]) { const f = fotos[(i + d + fotos.length) % fotos.length]; if (f) new Image().src = recurso(f); }
  }, [i, fotos]);

  const foto = fotos[i] ?? fotos[0] ?? "";
  // Va directo en <body>: dentro de la foto (que recorta lo que sobresale) no podría cubrir la pantalla
  return createPortal(
    <div ref={panel} role="dialog" aria-modal="true" aria-label={`Fotos de ${nombre}`}
      className="visor fixed inset-0 z-[60] flex flex-col bg-oscuro/95 text-white motion-safe:animate-entrar">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <p className="min-w-0 truncate text-sm text-white/80">{nombre}{fotos.length > 1 && <span className="ml-2 tabular-nums text-white/60" aria-hidden="true">{i + 1} / {fotos.length}</span>}</p>
        {fotos.length > 1 && <p className="sr-only" aria-live="polite">Foto {i + 1} de {fotos.length}</p>}
        <button ref={botonCerrar} type="button" onClick={cerrar} aria-label="Cerrar fotos"
          className="cerrar-gira presionable flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/85 hover:bg-white/10 hover:text-white"><IconoCerrar /></button>
      </div>
      {/* Mejora: tocar el fondo oscuro, fuera de la foto, también cierra */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- atajo con el mouse; Esc y la X cierran con el teclado */}
      <div className="relative min-h-0 flex-1 px-2 pb-4 sm:px-16" onClick={e => { if (e.target === e.currentTarget) cerrar(); }}>
        <button ref={caja} type="button" aria-label={cerca ? "Alejar la foto" : "Acercar la foto"}
          onPointerDown={alBajar} onPointerMove={alMover} onPointerUp={alSoltar}
          onPointerCancel={() => { arrastre.current = null; if (x !== 0 && !ocupado.current) volver(); }}
          // Con el teclado (Enter o espacio) también acerca y aleja, al centro
          onClick={e => { if (e.detail === 0) { setPunto({ x: 50, y: 50 }); setCerca(c => !c); } }}
          className={`claro-siempre relative h-full w-full overflow-hidden rounded-lg bg-white ${cerca ? "cursor-zoom-out touch-none" : "cursor-zoom-in touch-pan-y"}`}>
          <span className="block h-full w-full" style={{ transform: x ? `translateX(${x}px)` : undefined, transition: transicion }}>
            <img key={foto} src={recurso(foto)} alt={`${nombre}, foto ${i + 1} de ${fotos.length}`} draggable={false}
              className="visor-foto h-full w-full select-none object-contain p-4 transition-transform duration-200 ease-salida"
              style={{ transform: cerca ? `scale(${ZOOM})` : undefined, transformOrigin: `${punto.x}% ${punto.y}%` }} />
          </span>
        </button>
        {fotos.length > 1 && (
          <>
            {/* Animación 89: la flecha se asoma hacia su lado al pasar el mouse */}
            <button type="button" onClick={() => pasar(-1)} aria-label="Foto anterior"
              className="presionable group absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-oscuro/70 text-white hover:bg-oscuro sm:left-3"><IconoFlecha dir={-1} className="flecha-visor h-5 w-5 [--hacia:-3px]" /></button>
            <button type="button" onClick={() => pasar(1)} aria-label="Foto siguiente"
              className="presionable group absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-oscuro/70 text-white hover:bg-oscuro sm:right-3"><IconoFlecha className="flecha-visor h-5 w-5 [--hacia:3px]" /></button>
          </>
        )}
      </div>
      <p className="shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] text-center text-xs text-white/60">{cerca ? "Toca otra vez para alejar" : fotos.length > 1 ? "Toca la foto para acercarla o desliza para pasarla" : "Toca la foto para acercarla"}</p>
    </div>,
    document.body
  );
}
