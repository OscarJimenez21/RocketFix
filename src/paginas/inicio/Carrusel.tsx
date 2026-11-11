import { useEffect, useMemo, useRef, useState } from "react";
import { deTienda, desde, etiquetaDe, rotuloPrecio } from "../../data/catalogo";
import { tiendaPorId } from "../../data/tiendas";
import { FlechaMovil } from "../../components/FilaProductos";
import { FotoProducto } from "../../components/FotoProducto";
import { Pesos } from "../../components/Pesos";
import { Insignia } from "../../components/TarjetaProducto";
import { useEnPantalla, useVisto } from "../../lib/enPantalla";
import { hrefProducto } from "../../lib/rutas";
import type { Producto, TiendaId } from "../../types";
import { BotonPausa } from "./BotonPausa";

const PASO_CARRUSEL = 3500;

/** Tarjeta de las filas de la portada: foto grande, nombre y precio; toda la tarjeta lleva al producto.
    Las filas van debajo de la portada: sus fotos cargan cuando la persona se acerca a ellas */
function TarjetaVitrina({ producto: p, cinta }: { producto: Producto; cinta?: string }) {
  return (
    <a href={hrefProducto(p.id)} className="tarjeta-eleva group flex h-full flex-col overflow-hidden rounded-lg border border-linea bg-superficie transition-[border-color,box-shadow] duration-200 hover:border-linea-fuerte hover:shadow-tarjeta">
      <div className="escenario relative aspect-square p-7 sm:p-8">
        {/* Ancho de la tarjeta: 74 % de la pantalla en celular, 44 % en tableta y unos 290 px en computador */}
        <FotoProducto producto={p} alt={p.nombre} tamanos="(min-width: 1024px) 290px, (min-width: 640px) 44vw, 74vw" className="motion-safe:group-hover:scale-[1.05]" />
        {/* Animación 46: reflejo de vidrio que cruza la foto una vez al pasar el mouse */}
        <span aria-hidden="true" className="reflejo" />
        {/* brillo: la cinta tiene un destello que la cruza una vez cuando la fila aparece (ver .brillo en index.css) */}
        {cinta
          ? <span className="brillo absolute left-3 top-3 rounded-sm bg-acento-suave px-2 py-1 text-[13px] font-bold text-acento-texto">{cinta}</span>
          : <Insignia producto={p} className="left-3 top-3" />}
      </div>
      <div className="mt-auto border-t border-linea px-5 py-4">
        <p className="truncate text-[13px] font-semibold text-tinta-3">{etiquetaDe(p)}</p>
        <p className="mt-1 line-clamp-2 min-h-[2.75em] font-display text-[18px] font-bold leading-snug text-tinta">{p.nombre}</p>
        {/* Rótulo pequeño encima del precio, como en el catálogo en PDF: «Precio», o «Desde» si las versiones cambian de precio */}
        <p className="mt-2 text-xs leading-none text-tinta-3">{p.consultar ? "Precio" : rotuloPrecio(p)}</p>
        {p.consultar
          ? <p className="mt-1 font-display text-[17px] font-bold leading-tight text-tinta-2">Preguntar disponibilidad</p>
          : <p className="mt-1 font-display text-[22px] font-bold leading-tight tabular-nums text-tinta"><Pesos valor={desde(p)} /></p>}
      </div>
    </a>
  );
}

/** Fila de productos de la portada (tarjetas grandes solo con foto, nombre y precio). Avanza sola; se detiene con el
    mouse encima, al usar el teclado, mientras la persona la desliza con el dedo o con su botón de pausa, y no se mueve
    si la persona pidió menos movimiento. Al llegar al final vuelve al principio. */
export function Carrusel({ id, etiqueta, titulo, productos, enlaces = [], cinta, gris = false, final }: {
  id: string; etiqueta: React.ReactNode; titulo: string; productos: Producto[]; enlaces?: { texto: string; href: string }[]; cinta?: string; gris?: boolean;
  /** Última tarjeta de la fila: lleva a la sección completa cuando la fila solo muestra una parte */
  final?: { cantidad: number; texto: string; href: string };
}) {
  const fila = useRef<HTMLUListElement>(null);
  const [quieta, setQuieta] = useState(false);
  const [pausada, setPausada] = useState(false);
  const [reducir] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const reanudar = useRef<number>();

  const mover = (dir: 1 | -1) => {
    const el = fila.current;
    if (!el) return;
    const paso = (el.querySelector("li")?.getBoundingClientRect().width ?? 280) + 20;
    if (dir > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && el.scrollLeft <= 8) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * paso, behavior: "smooth" });
  };
  // Avanza solo mientras la fila se ve en pantalla
  const visible = useEnPantalla(fila);
  // La primera vez que la fila aparece, las cintas («Top ventas») tienen su destello
  const visto = useVisto(fila);
  const seMueve = !reducir && productos.length > 1;
  useEffect(() => {
    if (!seMueve || quieta || pausada || !visible) return;
    const t = window.setInterval(() => mover(1), PASO_CARRUSEL);
    return () => window.clearInterval(t);
  }, [seMueve, quieta, pausada, visible]);
  // Con el dedo: se detiene mientras la persona desliza y vuelve a moverse unos segundos después
  const tocar = () => {
    setQuieta(true);
    window.clearTimeout(reanudar.current);
    reanudar.current = window.setTimeout(() => setQuieta(false), 8000);
  };
  useEffect(() => () => window.clearTimeout(reanudar.current), []);

  const flecha = "presionable group flex h-11 w-11 items-center justify-center rounded-full border border-linea-fuerte bg-superficie hover:border-tinta-2";
  return (
    <section aria-labelledby={`t-${id}`} className={gris ? "textura-orbitas border-y border-linea bg-fondo" : ""}>
      <div className="contenedor py-12 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="etiqueta flex items-center gap-1.5">{etiqueta}</p>
            <h2 id={`t-${id}`} className="titulo-seccion titulo-trazo mt-1">{titulo}</h2>
            {enlaces.length > 0 && (
              <p className="flex flex-wrap gap-x-4 text-sm">
                {enlaces.map(e => <a key={e.href} href={e.href} className="enlace-suelto">{e.texto}</a>)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {seMueve && <BotonPausa pausado={pausada} alternar={() => setPausada(v => !v)} que={`la fila ${titulo}`} className={`${flecha} text-tinta-2`} />}
            <button type="button" onClick={() => mover(-1)} aria-label="Ver productos anteriores" className={flecha}><FlechaMovil dir={-1} /></button>
            <button type="button" onClick={() => mover(1)} aria-label="Ver productos siguientes" className={flecha}><FlechaMovil /></button>
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- una fila que se desliza debe poder enfocarse para moverla con las flechas del teclado */}
        <ul ref={fila} aria-label={titulo} tabIndex={0} data-visto={(cinta && visto) || undefined}
          onMouseEnter={() => setQuieta(true)} onMouseLeave={() => setQuieta(false)} onFocus={() => setQuieta(true)} onBlur={() => setQuieta(false)} onTouchStart={tocar}
          className="sin-barra -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
          {productos.map((p, k) => (
            <li key={p.id} style={cinta ? { "--orden": Math.min(k, 4) } as React.CSSProperties : undefined} className="w-[74%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-15px)]">
              <TarjetaVitrina producto={p} cinta={cinta} />
            </li>
          ))}
          {final && (
            <li className="w-[74%] shrink-0 snap-start sm:w-[44%] lg:w-[calc(25%-15px)]">
              <a href={final.href} className="tarjeta-eleva group flex h-full min-h-[260px] flex-col items-center justify-center gap-2 rounded-lg border border-linea-fuerte bg-superficie p-6 text-center transition-[border-color,box-shadow] duration-200 hover:border-marca hover:shadow-tarjeta">
                <span className="font-display text-[44px] font-extrabold leading-none tabular-nums text-marca-texto">{final.cantidad}</span>
                <span className="text-[15px] font-semibold text-tinta-2">{final.texto}</span>
                <span className="btn btn-borde mt-3">Ver todos<FlechaMovil /></span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

/** Todos los productos de una o varias secciones para una fila de la portada, alternando marcas para que la fila no
    quede de una sola marca seguida. Empiezan las marcas con más productos; dentro de cada marca, el orden de la tienda. */
function variados(tiendas: TiendaId[]) {
  const porMarca = new Map<string, Producto[]>();
  for (const p of tiendas.flatMap(id => deTienda(id)).filter(p => p.imagen && !p.consultar)) {
    const lista = porMarca.get(p.marca || "") ?? [];
    lista.push(p);
    porMarca.set(p.marca || "", lista);
  }
  const marcas = [...porMarca.values()].sort((a, b) => b.length - a.length);
  const fila: Producto[] = [];
  while (marcas.some(l => l.length)) {
    for (const l of marcas) {
      const p = l.shift();
      if (p) fila.push(p);
    }
  }
  return fila;
}

/** Cuántos productos muestra cada fila de sección en la portada. Antes iban todos (hasta 275 tarjetas en una sola fila):
    nadie desliza tantas, y la portada pesaba el triple. El resto se ve en la sección, a la que lleva la última tarjeta */
const TOPE_FILA = 16;

/** Fila con los productos de una o varias secciones, con enlace a cada sección */
export function Coleccion({ id, etiqueta, titulo, tiendas, gris = false }: { id: string; etiqueta: string; titulo: string; tiendas: TiendaId[]; gris?: boolean }) {
  const todos = useMemo(() => variados(tiendas), [tiendas]);
  const secciones = tiendas.map(tiendaPorId).filter((t): t is NonNullable<typeof t> => Boolean(t));
  // El número es el de la sección completa (la fila no muestra los de «Preguntar disponibilidad»)
  const total = secciones.reduce((n, t) => n + deTienda(t.id).length, 0);
  const enlaces = secciones.map(t => ({ texto: tiendas.length > 1 ? `Ver ${t.menu.toLowerCase()}` : `Ver todo (${deTienda(t.id).length})`, href: `#${t.vista}` }));
  if (!todos.length) return null;
  const primera = secciones[0];
  const final = todos.length > TOPE_FILA && primera
    ? { cantidad: total, texto: secciones.length > 1 ? "productos en estas secciones" : `productos en ${primera.menu.toLowerCase()}`, href: `#${primera.vista}` }
    : undefined;
  return <Carrusel id={id} etiqueta={etiqueta} titulo={titulo} productos={final ? todos.slice(0, TOPE_FILA) : todos} enlaces={enlaces} gris={gris} final={final} />;
}
