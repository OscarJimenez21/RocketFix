/* Fondo de la portada: el cohete del logo despega por el verde y deja una estela.
   La primera vez que se abre la página en la visita, el cohete sube por la curva y la estela se dibuja detrás de él; después
   queda solo la estela, quieta, con su trayectoria punteada y unas pocas estrellas.
   Con «reducir movimiento» (o en navegadores que no mueven cosas por una curva) la estela aparece ya dibujada, sin cohete.
   Todo va detrás del contenido, no se puede tocar y los lectores de pantalla no lo leen. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useEnPantalla } from "../lib/enPantalla";
import { Cohete } from "./Logo";

let yaDespego = false;

/** Medidas de la portada: ancho, alto, dónde empieza la vitrina y dónde están los botones (en celular la curva pasa por el
    espacio libre a la derecha de los botones, sin cruzar el texto) */
type Medidas = { w: number; h: number; vitrina: number; botones: number };

/** Curva del despegue. En computador sale por abajo a la izquierda, pasa entre el texto y la vitrina y se va por la esquina
    de arriba a la derecha. En celular sale de detrás de la vitrina y sube a la derecha de los botones hasta salir por el borde. */
function curva({ w, h, vitrina, botones }: Medidas) {
  const r = Math.round;
  if (w >= 1024) return { d: `M -60 ${r(h * 0.97)} C ${r(w * 0.36)} ${r(h * 1.02)}, ${r(w * 0.6)} ${r(h * 0.6)}, ${r(w + 70)} -70`, x1: 0, y1: h, x2: w, y2: 0 };
  return {
    d: `M ${r(w * 0.28)} ${r(vitrina + 60)} C ${r(w * 0.5)} ${r(vitrina - 14)}, ${r(w * 0.85)} ${r((vitrina + botones) / 2)}, ${r(w + 50)} ${r(botones - 6)}`,
    x1: w * 0.3, y1: vitrina, x2: w, y2: botones
  };
}

/** Estrellas: posición en % del ancho y del alto, radio y opacidad (fijas, para que siempre se vean igual) */
const ESTRELLAS: [number, number, number, number][] = [
  [4, 12, 1.2, 0.45], [11, 70, 1, 0.3], [21, 6, 1.4, 0.4], [29, 92, 1, 0.25], [36, 28, 0.9, 0.25], [46, 9, 1.2, 0.35],
  [55, 96, 1, 0.3], [61, 4, 1, 0.4], [67, 52, 1.3, 0.3], [79, 7, 1.1, 0.4], [86, 95, 1, 0.3], [93, 24, 1.3, 0.4],
  [97, 64, 1, 0.35], [2, 46, 1, 0.3], [49, 48, 0.9, 0.2], [74, 88, 1.2, 0.3], [16, 34, 1, 0.2], [99, 4, 1.2, 0.4]
];

/** Animación 3: estrellas que titilan, cada una a su ritmo (posición en %, retraso en segundos) */
const TITILAN: [number, number, number][] = [[8, 22, 0], [33, 4, 1.2], [57, 14, 2.3], [71, 30, 0.6], [89, 12, 1.7], [95, 46, 2.8], [24, 58, 3.1]];

export function Despegue() {
  const caja = useRef<HTMLDivElement>(null);
  const cohete = useRef<HTMLDivElement>(null);
  const estelas = useRef<SVGPathElement[]>([]);
  const [t, setT] = useState<Medidas | null>(null);
  const [vuela, setVuela] = useState(() =>
    !yaDespego && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && Boolean(window.CSS?.supports?.("offset-path", "path('M 0 0 L 1 1')")));

  // Mide la portada (y vuelve a medir si cambia de tamaño) para que la curva cruce siempre por el mismo lugar
  useLayoutEffect(() => {
    const el = caja.current;
    if (!el) return;
    // offsetTop (no getBoundingClientRect): no cambia mientras el texto entra en cascada con su desplazamiento
    const medir = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const sec = el.parentElement;
      const vitrina = sec?.querySelector<HTMLElement>("[role=region]")?.offsetTop ?? h * 0.6;
      const botones = sec?.querySelector<HTMLElement>("[data-despegue]")?.offsetTop ?? h * 0.38;
      setT(x => (x && x.w === w && x.h === h && x.vitrina === vitrina && x.botones === botones ? x : { w, h, vitrina, botones }));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => { yaDespego = true; }, []);

  // El vuelo: el cohete avanza por la curva y la estela se dibuja al mismo ritmo (misma duración y curva de tiempo).
  // Arranca lento y acelera, como un despegue; empieza cuando el texto de la portada ya va entrando
  const medido = t !== null;
  useEffect(() => {
    if (!vuela || !medido || !cohete.current) return;
    const tiempo: KeyframeAnimationOptions = { duration: 2600, delay: 500, easing: "cubic-bezier(0.55, 0, 0.25, 1)", fill: "both" };
    const vuelo = cohete.current.animate([{ offsetDistance: "0%", opacity: 0 }, { opacity: 1, offset: 0.06 }, { offsetDistance: "100%", opacity: 1 }], tiempo);
    const trazos = estelas.current.map(p => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], tiempo));
    vuelo.onfinish = () => setVuela(false);
    return () => { vuelo.cancel(); trazos.forEach(a => a.cancel()); };
  }, [vuela, medido]);

  // Las estrellas que titilan se detienen mientras la portada no se ve (data-fuera)
  const visible = useEnPantalla(caja);
  const c = t && t.w > 0 ? curva(t) : null;
  return (
    <div ref={caja} aria-hidden="true" data-fuera={!visible || undefined} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Luz suave detrás de la vitrina (abajo en celular, a la derecha en computador) */}
      <span className="absolute inset-0 bg-[radial-gradient(70%_38%_at_50%_80%,rgba(91,224,169,0.14),transparent_72%)] lg:bg-[radial-gradient(40%_62%_at_80%_50%,rgba(91,224,169,0.16),transparent_72%)]" />
      {TITILAN.map(([x, y, s]) => <span key={`${x}-${y}`} className="estrella-titila" style={{ left: `${x}%`, top: `${y}%`, "--t": `${s}s` } as React.CSSProperties} />)}
      {t && c && (
        <svg width={t.w} height={t.h} viewBox={`0 0 ${t.w} ${t.h}`} className="absolute inset-0">
          <defs>
            <linearGradient id="rf-estela" gradientUnits="userSpaceOnUse" x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}>
              <stop offset="0" stopColor="#5BE0A9" stopOpacity="0" />
              <stop offset="0.5" stopColor="#5BE0A9" stopOpacity="0.45" />
              <stop offset="1" stopColor="#5BE0A9" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          {ESTRELLAS.map(([x, y, r, o], i) => <circle key={i} cx={(x / 100) * t.w} cy={(y / 100) * t.h} r={r * 1.2} fill="#fff" opacity={Math.min(1, o * 1.5)} />)}
          {/* Trayectoria punteada, la estela con un halo ancho y la línea fina encima */}
          <path d={c.d} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 9" />
          {[{ ancho: 16, opacidad: 0.14 }, { ancho: 2.5, opacidad: 1 }].map((e, i) => (
            <path key={i} ref={el => { if (el) estelas.current[i] = el; }} d={c.d} pathLength={1} fill="none" stroke="url(#rf-estela)"
              strokeOpacity={e.opacidad} strokeWidth={e.ancho} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={0} />
          ))}
        </svg>
      )}
      {vuela && c && (
        // El cohete mira hacia arriba; "auto 90deg" lo gira para que la punta siga la curva
        <div ref={cohete} className="absolute left-0 top-0 h-11 w-11 opacity-0 lg:h-14 lg:w-14"
          style={{ offsetPath: `path("${c.d}")`, offsetRotate: "auto 90deg" }}>
          {/* Fuego del motor: una luz naranja detrás de la cola */}
          <span className="absolute left-1/2 top-[72%] h-[85%] w-[85%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,107,44,0.85),rgba(255,107,44,0))]" />
          <Cohete className="relative h-full w-full text-white" />
        </div>
      )}
    </div>
  );
}
