import { useMemo, useRef, useState } from "react";
import { VITRINA, desde, etiquetaDe, porId, rotuloPrecio } from "../../data/catalogo";
import { FotoProducto } from "../../components/FotoProducto";
import { activa } from "../../lib/animaciones";
import { useEnPantalla } from "../../lib/enPantalla";
import { dinero } from "../../lib/formato";
import { hrefProducto } from "../../lib/rutas";
import type { Producto } from "../../types";
import { BotonPausa } from "./BotonPausa";

// Los productos de la vitrina y su orden están en src/data/contenido.json («vitrina»)
const ESPERA_VITRINA = 6000;

/** Vitrina: un producto grande y los demás en miniatura. Cambia sola con un fundido; se detiene con el mouse encima,
    al usar el teclado o con su botón de pausa, no se mueve si la persona pidió menos movimiento y deja de cambiar cuando
    la persona elige un producto (en celular no hay mouse que la detenga). */
export function Vitrina() {
  // Los de «Preguntar disponibilidad» no salen en la vitrina
  const productos = useMemo(() => VITRINA.map(id => porId[id]).filter((p): p is Producto => Boolean(p) && !p?.consultar), []);
  const [i, setI] = useState(0);
  // Cuántas veces ha cambiado (el nombre y el precio solo entran con fundido desde el primer cambio, no al cargar)
  const [cambios, setCambios] = useState(0);
  const [quieta, setQuieta] = useState(false);
  const [elegida, setElegida] = useState(false);
  const [pausada, setPausada] = useState(false);
  const [reducir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const caja = useRef<HTMLDivElement>(null);
  const visible = useEnPantalla(caja);
  // Animación 4: de cuál producto viene y hacia qué lado avanza (1: siguiente, -1: anterior)
  const [mov, setMov] = useState<{ de: number; dir: 1 | -1 } | null>(null);
  const ir = (j: number, dir: 1 | -1 = j > i ? 1 : -1) => { setMov({ de: i, dir }); setI(j); setCambios(n => n + 1); };
  const lados = activa(4) && mov !== null;

  // El tiempo lo lleva la línea que se llena bajo la miniatura activa: al llenarse, pasa al siguiente producto.
  // Se detiene con el mouse encima, al usar el teclado, con la pausa o mientras la vitrina no se ve; si la persona elige
  // un producto, se quita (y con ella el botón de pausa, porque ya no hay nada que se mueva)
  const seMueve = !elegida && !reducir && productos.length > 1;

  const p = productos[i];
  if (!p) return null;
  return (
    // vitrina-flota: sube y baja 4 px muy despacio, como sin gravedad; se queda quieta con el mouse encima o fuera de la
    // pantalla (animación 47)
    <div ref={caja} role="region" aria-roledescription="carrusel" aria-label="Productos destacados" data-quieta={quieta || !visible || undefined}
      className="vitrina-flota tarjeta w-full overflow-hidden border-0 text-tinta"
      onMouseEnter={() => setQuieta(true)} onMouseLeave={() => setQuieta(false)} onFocus={() => setQuieta(true)} onBlur={() => setQuieta(false)}>
      <div className="escenario relative aspect-[4/3]">
        {productos.map((x, j) => (
          <a key={x.id} href={hrefProducto(x.id)} tabIndex={j === i ? 0 : -1} aria-hidden={j !== i}
            // escenario también en cada foto: mientras entra o sale se mueve sola (queda aparte del fondo de la caja) y la foto
            // se funde con el fondo que lleva consigo
            className={`escenario absolute inset-0 p-6 transition-[opacity,transform] duration-500 ease-salida sm:p-8 ${j === i ? "opacity-100" : "pointer-events-none scale-[0.96] opacity-0"}${
              lados && j === i ? (mov.dir > 0 ? " vitrina-entra-der" : " vitrina-entra-izq") : lados && j === mov.de ? (mov.dir > 0 ? " vitrina-sale-izq" : " vitrina-sale-der") : ""}`}>
            {/* La primera ya la pidió el HTML en su tamaño original: va sin copias livianas para no bajarla dos veces */}
            <FotoProducto producto={x} alt={x.nombre} prioridad={j === 0} tamanos={j === 0 ? undefined : "(min-width: 1280px) 480px, (min-width: 1024px) 420px, 92vw"} />
          </a>
        ))}
        <span className="absolute left-3 top-3 rounded-sm bg-fondo px-2 py-1 text-[13px] font-semibold text-tinta-2">{etiquetaDe(p)}</span>
        {seMueve && (
          <BotonPausa pausado={pausada} alternar={() => setPausada(v => !v)} que="los productos destacados"
            className="presionable absolute right-3 top-3 flex h-10 w-10 items-center justify-center claro-siempre rounded-full border border-linea bg-white/95 text-tinta-2 hover:border-linea-fuerte hover:text-tinta" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-linea px-4 py-3.5 sm:px-5" aria-live={quieta || elegida || pausada ? "polite" : "off"}>
        {/* El nombre y el precio cambian junto con la foto (entran con un fundido corto) */}
        <div key={p.id} className={`min-w-0 ${cambios ? "motion-safe:animate-entrar" : ""}`}>
          <p className="truncate font-display text-[17px] font-bold">{p.nombre}</p>
          <p className="text-sm text-tinta-2">{rotuloPrecio(p) === "Desde" && "Desde "}<b className="font-display text-[15px] tabular-nums text-tinta">{dinero(desde(p))}</b></p>
        </div>
        <a href={hrefProducto(p.id)} className="btn btn-sm btn-marca shrink-0">Ver producto</a>
      </div>
      {/* Miniaturas del tamaño de 6 por fila; si hay menos (los de «Preguntar disponibilidad» no salen), quedan centradas */}
      <div className="grid justify-center gap-[var(--hueco)] border-t border-linea bg-fondo p-2 [--hueco:0.375rem] sm:p-2.5 sm:[--hueco:0.5rem]"
        style={{ gridTemplateColumns: `repeat(${productos.length}, calc((100% - 5 * var(--hueco)) / 6))` }}>
        {productos.map((x, j) => (
          <button key={x.id} type="button" onClick={() => { if (j !== i) ir(j); setElegida(true); }} aria-label={`Ver ${x.nombre}`} aria-current={j === i || undefined}
            className={`presionable escenario relative aspect-square overflow-hidden rounded border p-1 ${j === i ? "border-marca ring-1 ring-marca" : "border-linea hover:border-linea-fuerte"}`}>
            <FotoProducto producto={x} alt="" tamanos="80px" />
            {/* Línea que se llena en 6 s: cuenta el tiempo hasta el siguiente producto (la clave la reinicia en cada cambio) */}
            {seMueve && j === i && (
              <span key={cambios} aria-hidden="true" onAnimationEnd={() => ir((i + 1) % productos.length, 1)}
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-marca"
                style={{ animation: `avance ${ESPERA_VITRINA}ms linear forwards`, animationPlayState: quieta || pausada || !visible ? "paused" : "running" }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
