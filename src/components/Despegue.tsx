/* Fondo de la portada: el cohete del logo despega por el verde y deja una estela.
   La primera vez que se abre la página en la visita, el cohete sube por la curva y la estela se dibuja detrás de él; después
   queda solo la estela, quieta, con su trayectoria punteada, y un cielo de estrellas que baja despacio (animación 41).
   Con «reducir movimiento» (o en navegadores que no mueven cosas por una curva) la estela aparece ya dibujada, sin cohete.
   Todo va detrás del contenido, no se puede tocar y los lectores de pantalla no lo leen. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { activa } from "../lib/animaciones";
import { RITMO_FUGACES, useFaseCielo } from "../lib/cielo";
import { useEnPantalla } from "../lib/enPantalla";
import { TEMPORADA } from "../lib/temporada";
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

/** Capa de cielo que baja sin cortes: lleva sus estrellas dos veces, una encima de la otra, y se desplaza exactamente un
    alto de la portada antes de volver a empezar (en ese punto la copia de arriba quedó donde estaba la original) */
function Capa({ clase, children }: { clase: string; children: React.ReactNode }) {
  return (
    <div className={`${clase} absolute inset-0`}>
      <div className="absolute inset-0">{children}</div>
      <div className="absolute inset-0 -translate-y-full">{children}</div>
    </div>
  );
}

/** Animación 42: estrellas fugaces en tandas al azar (de 1 a 5 a la vez, cada 1,5 a 6 s), por cualquier parte de la
    portada y con distinto largo, grosor, ángulo, dirección y velocidad. Solo mientras la portada se ve, nunca con «reducir movimiento» y nunca con la
    pestaña en segundo plano. Cada una se crea al lanzarla y se borra al terminar. */
function Fugaces({ visible, ritmo }: { visible: boolean; ritmo: number }) {
  const caja = useRef<HTMLDivElement>(null);
  // El ritmo cambia con la hora (animación 43) sin reiniciar las tandas
  const ritmoRef = useRef(ritmo);
  ritmoRef.current = ritmo;
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const relojes = new Set<number>();
    const esperar = (fn: () => void, ms: number) => { const id = window.setTimeout(() => { relojes.delete(id); fn(); }, ms); relojes.add(id); };
    const vivas = new Set<Animation>();
    const azar = (a: number, b: number) => a + Math.random() * (b - a);

    /** Una estrella: nace en (x, y) y recorre `recorre` px con un ángulo `ang` (grados en sentido del reloj desde la
        derecha: 20 baja hacia la derecha, 160 baja hacia la izquierda) */
    const una = (el: HTMLDivElement, x: number, y: number, ang: number, recorre: number, chica: boolean) => {
      const largo = chica ? azar(45, 85) : azar(80, 150); // la cola
      const rad = (ang * Math.PI) / 180;
      const s = document.createElement("span");
      s.className = "fugaz";
      s.style.cssText = `left:${x - largo}px;top:${y}px;width:${largo}px;height:${chica ? 1.5 : 2}px`;
      // Animación 52: en temporada, las fugaces toman los colores de la fecha (doradas en Navidad, etc.)
      const colores = TEMPORADA && activa(52) ? TEMPORADA.fugaces : null;
      if (colores?.length) s.style.setProperty("--fugaz", colores[Math.floor(Math.random() * colores.length)] ?? "#fff");
      el.appendChild(s);
      const giro = `rotate(${ang}deg)`;
      const a = s.animate(
        [
          { transform: `translate(0, 0) ${giro} scaleX(0.3)`, opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { opacity: 1, offset: 0.7 },
          { transform: `translate(${recorre * Math.cos(rad)}px, ${recorre * Math.sin(rad)}px) ${giro} scaleX(1)`, opacity: 0 }
        ],
        { duration: azar(650, 1300), easing: "cubic-bezier(0.4, 0, 0.7, 1)" }
      );
      vivas.add(a);
      a.onfinish = a.oncancel = () => { vivas.delete(a); s.remove(); };
    };

    /** Elige por dónde pasa. La tarjeta de la vitrina es blanca y tapa lo que va detrás: ninguna nace debajo de ella.
        En computador (vitrina a la derecha) unas cruzan el lado del texto en diagonal y otras pasan casi horizontales
        por las franjas verdes de arriba y de abajo de la vitrina, para que ese lado también tenga. En celular (vitrina
        abajo) todas nacen y terminan encima de la vitrina */
    const lanzar = () => {
      const el = caja.current;
      if (!el || !activa(42) || document.hidden || el.clientWidth === 0) return;
      const w = el.clientWidth, h = el.clientHeight;
      const c0 = el.getBoundingClientRect();
      const r = el.parentElement?.parentElement?.querySelector("[role=region]")?.getBoundingClientRect();
      const v = r ? { izq: r.left - c0.left, der: r.right - c0.left, arriba: r.top - c0.top, abajo: r.bottom - c0.top } : null;
      const hacia = (izquierda: boolean, a: number) => (izquierda ? 180 - a : a);

      if (v && v.izq > w * 0.5) {
        const franjas = [{ y0: 6, y1: v.arriba - 10 }, { y0: v.abajo + 10, y1: h - 6 }].filter(f => f.y1 - f.y0 >= 24);
        const franja = franjas[Math.floor(Math.random() * franjas.length)];
        const dentro = (x: number, y: number) => x > v.izq - 8 && x < v.der + 8 && y > v.arriba - 8 && y < v.abajo + 8;
        if (franja && Math.random() < 0.35) {
          // Lado de la vitrina: casi horizontal por una franja verde, hacia un lado o el otro
          const izq = Math.random() < 0.6;
          una(el, izq ? azar(v.izq + 80, w + 30) : azar(v.izq - 120, v.der - 160), azar(franja.y0, franja.y1), hacia(izq, azar(1, 8)), azar(240, 520), Math.random() < 0.4);
        } else {
          // Cualquier otro punto del verde (también a la derecha y debajo de la vitrina), en cualquier diagonal hacia abajo;
          // si al pasar se mete detrás de la vitrina, se ve entrar y salir, como si pasara por detrás
          let x = 0, y = 0;
          for (let i = 0; i < 8; i++) { x = azar(w * 0.04, w); y = azar(0, h * 0.75); if (!dentro(x, y)) break; }
          if (dentro(x, y)) return;
          una(el, x, y, hacia(Math.random() < 0.65, azar(8, 55)), azar(180, w * 0.42), Math.random() < 0.45);
        }
      } else {
        const ang = azar(15, 38), recorre = azar(170, 300);
        const techo = (v ? v.arriba : h) - recorre * Math.sin((ang * Math.PI) / 180) - 20;
        una(el, azar(w * 0.1, w), azar(0, Math.max(0, techo)), hacia(Math.random() < 0.7, ang), recorre, Math.random() < 0.5);
      }
    };

    // Tandas al azar: casi siempre 1 o 2 estrellas, a veces 3, y de vez en cuando una lluvia de 4 o 5, cada una con su
    // propio retraso dentro de la tanda. Entre tanda y tanda pasan de 1,5 a 6 s, también al azar
    const cuantas = () => {
      const n = Math.random();
      return n < 0.4 ? 1 : n < 0.68 ? 2 : n < 0.85 ? 3 : n < 0.94 ? 4 : 5;
    };
    const ciclo = () => {
      const n = cuantas();
      for (let i = 0; i < n; i++) esperar(lanzar, i === 0 ? 0 : azar(80, 1100));
      esperar(ciclo, (azar(1500, 6000) + (n >= 4 ? 1500 : 0)) * ritmoRef.current);
    };
    // La primera espera a que termine el despegue del cohete
    esperar(ciclo, 3400);
    return () => { relojes.forEach(id => window.clearTimeout(id)); vivas.forEach(a => a.cancel()); };
  }, [visible]);
  return <div ref={caja} className="absolute inset-0" />;
}

/** Animación 53: cada 35 a 70 s un satélite (un puntico con luces que parpadean en rojo y verde) cruza despacio la parte
    de arriba de la portada en línea recta, de un borde al otro, en unos 22 a 30 s */
function Satelite({ visible }: { visible: boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let reloj = 0;
    let vuelo: Animation | null = null;
    const pasar = () => {
      const el = caja.current;
      if (el && activa(53) && !document.hidden && el.clientWidth > 0) {
        const w = el.clientWidth, h = el.clientHeight;
        const izq = Math.random() < 0.5;
        const y0 = h * (0.04 + Math.random() * 0.14), y1 = y0 + h * (Math.random() * 0.16 - 0.04);
        const s = document.createElement("span");
        s.className = "satelite";
        el.appendChild(s);
        vuelo = s.animate(
          [
            { transform: `translate(${izq ? w + 20 : -20}px, ${y0}px)`, opacity: 0 },
            { opacity: 1, offset: 0.06 },
            { opacity: 1, offset: 0.94 },
            { transform: `translate(${izq ? -20 : w + 20}px, ${y1}px)`, opacity: 0 }
          ],
          { duration: 22000 + Math.random() * 8000, easing: "linear" }
        );
        vuelo.onfinish = vuelo.oncancel = () => s.remove();
      }
      reloj = window.setTimeout(pasar, 35000 + Math.random() * 35000);
    };
    reloj = window.setTimeout(pasar, 9000 + Math.random() * 8000);
    return () => { window.clearTimeout(reloj); vuelo?.cancel(); };
  }, [visible]);
  return <div ref={caja} className="absolute inset-0" />;
}

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

  // Las estrellas se detienen mientras la portada no se ve (data-fuera)
  const visible = useEnPantalla(caja);
  // Animación 43: el cielo según la hora de Bogotá (tono del fondo, cuántas estrellas se ven y el ritmo de las fugaces)
  const fase = useFaseCielo();
  const conHora = activa(43);
  const c = t && t.w > 0 ? curva(t) : null;
  return (
    <div ref={caja} aria-hidden="true" data-fuera={!visible || undefined} data-cielo={conHora ? fase : undefined} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Tono del cielo según la hora (ver [data-cielo] en index.css) */}
      <span className="tono-cielo absolute inset-0" />
      {/* Luz suave detrás de la vitrina (abajo en celular, a la derecha en computador) */}
      <span className="absolute inset-0 bg-[radial-gradient(70%_38%_at_50%_80%,rgba(91,224,169,0.14),transparent_72%)] lg:bg-[radial-gradient(40%_62%_at_80%_50%,rgba(91,224,169,0.16),transparent_72%)]" />
      {/* Animación 41: el cielo baja despacio, como si la portada fuera subiendo con el cohete. Las estrellas tenues van
          lejos y lentas; las que titilan, más cerca y un poco más rápido */}
      {/* Animación 59: cada capa va dentro de otra que se corre con el mouse (la de adentro sigue bajando sola) */}
      <div className="paralaje-lejos absolute inset-0">
        <Capa clase="cielo-lejos">
          {ESTRELLAS.map(([x, y, r, o], i) => (
            <span key={i} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: r * 2.4, height: r * 2.4, opacity: Math.min(1, o * 1.5) }} />
          ))}
        </Capa>
      </div>
      <div className="paralaje-cerca absolute inset-0">
        <Capa clase="cielo-cerca">
          {TITILAN.map(([x, y, s]) => <span key={`${x}-${y}`} className="estrella-titila" style={{ left: `${x}%`, top: `${y}%`, "--t": `${s}s` } as React.CSSProperties} />)}
        </Capa>
      </div>
      <Satelite visible={visible} />
      <Fugaces visible={visible} ritmo={conHora ? RITMO_FUGACES[fase] : 1} />
      {t && c && (
        <svg width={t.w} height={t.h} viewBox={`0 0 ${t.w} ${t.h}`} className="absolute inset-0">
          <defs>
            <linearGradient id="rf-estela" gradientUnits="userSpaceOnUse" x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}>
              <stop offset="0" stopColor="#5BE0A9" stopOpacity="0" />
              <stop offset="0.5" stopColor="#5BE0A9" stopOpacity="0.45" />
              <stop offset="1" stopColor="#5BE0A9" stopOpacity="0.9" />
            </linearGradient>
          </defs>
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
