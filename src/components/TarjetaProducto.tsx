import { useCallback, useEffect, useRef, useState } from "react";
import { etiquetaDe, recienLlegado, textoConsulta } from "../data/catalogo";
import { useGaleria } from "../lib/galerias";
import { BotonFavorito } from "./Favorito";
import { useTienda } from "../estado/TiendaContext";
import { activa } from "../lib/animaciones";
import { precargarFoto, precargarProducto } from "../lib/carga";
import { dinero, recurso, srcsetFoto } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import { tinteDe } from "../lib/tinte";
import { abrirConVuelo } from "../lib/transicion";
import { volarAlCarrito } from "../lib/vuelo";
import { waLink } from "../lib/whatsapp";
import type { Producto } from "../types";
import { FotoProducto, Imagen } from "./FotoProducto";
import { Pesos } from "./Pesos";
import { IconoCheck, IconoWhatsApp } from "./Iconos";

/** Etiquetas sobre la foto, arriba a la izquierda: el estado cuando no es nuevo (CPO, Usado, Open box) y «Recién llegado»
    los primeros días después de que el producto entra al catálogo (ver recienLlegado en data/catalogo.ts) */
export function Insignia({ producto, className = "left-2 top-2" }: { producto: Producto; className?: string }) {
  const estado = producto.estado !== "Nuevo";
  const recien = recienLlegado(producto);
  if (!estado && !recien) return null;
  return (
    <span className={`absolute flex flex-col items-start gap-1 ${className}`}>
      {estado && <span className="rounded-sm bg-oscuro px-1.5 py-0.5 text-[12.5px] font-semibold text-white">{producto.estado}</span>}
      {recien && <span className="insignia-nueva relative inline-flex items-center gap-1 overflow-hidden rounded-sm bg-marca-menta px-1.5 py-0.5 text-[12.5px] font-semibold text-marca-noche"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-marca-noche" />Recién llegado</span>}
    </span>
  );
}

/** Nota del producto ("Obsequio: audífonos", "Sobre pedido"…): la disponibilidad va en gris, los regalos en verde */
export function NotaProducto({ nota, className = "" }: { nota: string; className?: string }) {
  const pedido = /pedido/i.test(nota);
  return <span className={`inline-block rounded-sm px-1.5 py-0.5 text-[12px] font-semibold ${pedido ? "bg-fondo text-tinta-2" : "bg-marca-suave text-marca-oscuro"} ${className}`}>{nota}</span>;
}

export function TextoAgregar({ cantidad, tope }: { cantidad: number; tope: boolean }) {
  return <>{tope ? "Sin más unidades" : cantidad ? "Agregar otra" : "Agregar"}</>;
}

/** Después de agregar, el botón dice «Agregado» con un ✓ durante 1,2 s (confirma que el toque funcionó); luego vuelve a
    «Agregar otra». Cada vez que se agrega, el ✓ vuelve a aparecer y el tiempo empieza de nuevo. */
export function useAgregado() {
  const [vez, setVez] = useState(0);
  const [recien, setRecien] = useState(false);
  const reloj = useRef<number>();
  useEffect(() => () => window.clearTimeout(reloj.current), []);
  const marcar = useCallback(() => {
    setVez(n => n + 1);
    setRecien(true);
    window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setRecien(false), 1200);
  }, []);
  return { vez, recien, marcar };
}

/** Texto del botón de agregar: «Agregado ✓» justo después de agregar; si no, «Agregar», «Agregar otra» o «Sin más unidades» */
export function EtiquetaAgregar({ vez, recien, cantidad, tope, sufijo = "" }: { vez: number; recien: boolean; cantidad: number; tope: boolean; sufijo?: string }) {
  if (recien) {
    return <span key={`ok-${vez}`} className="inline-flex items-center gap-1.5"><IconoCheck className="h-4 w-4 shrink-0 motion-safe:animate-marcar" />Agregado</span>;
  }
  // Al volver de «Agregado», el texto entra con un fundido corto (la primera vez no se mueve)
  return <span key={`texto-${vez}`} className={`inline-block ${vez ? "motion-safe:animate-entrar" : ""}`}><TextoAgregar cantidad={cantidad} tope={tope} />{sufijo}</span>;
}

/** Cómo se elige la versión en la tarjeta (mismo alto en los tres casos, para que los precios de una fila queden parejos):
    - Idea 6: si todas las versiones son solo colores («Negro», «Blanca»…), puntos de color.
    - Idea 8: si son 2 o 3 y de nombre corto («128 GB», «1 TB»), pastillas para tocar.
    - Si no, la lista desplegable de siempre (con el precio de cada una). */
function modoVersion(p: Producto): "colores" | "pastillas" | "lista" {
  if (p.opciones.every(o => tinteDe(o.nombre) && !/\d/.test(o.nombre)) && p.opciones.length <= 5) return "colores";
  if (p.opciones.length <= 3 && p.opciones.every(o => o.nombre.length > 0 && o.nombre.length <= 7)) return "pastillas";
  return "lista";
}

function ElegirVersion({ producto: p, i, elegir }: { producto: Producto; i: number; elegir: (j: number) => void }) {
  const modo = modoVersion(p);
  const rotulo = `${p.etiqueta || (modo === "colores" ? "Color" : "Versión")} de ${p.nombre}`;
  if (modo === "lista") {
    return (
      <label className="mb-2.5 block">
        <span className="sr-only">{rotulo}</span>
        <select value={i} onChange={e => elegir(Number(e.target.value))}
          className="h-11 w-full truncate rounded border border-linea bg-fondo px-2 text-[13px] text-tinta focus:border-marca focus:outline-none sm:h-9">
          {p.opciones.map((op, j) => <option key={j} value={j}>{p.consultar ? op.nombre : `${op.nombre} · ${dinero(op.precio)}`}</option>)}
        </select>
      </label>
    );
  }
  if (modo === "colores") {
    return (
      <div role="radiogroup" aria-label={rotulo} className="mb-2.5 flex h-11 items-center gap-0.5 sm:h-9">
        {p.opciones.map((op, j) => (
          <button key={j} type="button" role="radio" aria-checked={j === i} aria-label={op.nombre} title={op.nombre} onClick={() => elegir(j)}
            className="presionable flex h-11 w-8 shrink-0 items-center justify-center sm:h-9">
            <span className={`punto-color h-5 w-5 rounded-full border border-black/15 ${j === i ? "elegido ring-2 ring-marca ring-offset-2 ring-offset-superficie" : ""}`} style={{ background: tinteDe(op.nombre) ?? undefined }} />
          </button>
        ))}
        <span className="ml-1 min-w-0 truncate text-[12.5px] text-tinta-2">{p.opciones[i]?.nombre}</span>
      </div>
    );
  }
  return (
    <div role="radiogroup" aria-label={rotulo} className="mb-2.5 flex h-11 gap-1 sm:h-9">
      {p.opciones.map((op, j) => (
        <button key={j} type="button" role="radio" aria-checked={j === i} onClick={() => elegir(j)}
          className={`presionable min-w-0 flex-1 truncate rounded border px-1 text-[12.5px] font-semibold transition-colors duration-150 ${j === i ? "border-marca bg-marca-suave text-marca-texto" : "border-linea bg-fondo text-tinta-2 hover:border-linea-fuerte"}`}>
          {op.nombre}
        </button>
      ))}
    </div>
  );
}

/** Idea 7 (animación 62): con el mouse encima, la segunda foto de la galería aparece sobre la primera. No se pide hasta
    que el mouse entra por primera vez a la tarjeta (en celular nunca se baja) */
function SegundaFoto({ producto: p, ver }: { producto: Producto; ver: boolean }) {
  // Las galerías se piden la primera vez que el mouse entra a una tarjeta (lib/galerias.ts)
  const otra = useGaleria(p, ver)[1];
  if (!otra || !ver) return null;
  return (
    <Imagen src={recurso(otra)} srcSet={srcsetFoto(otra)} sizes="(min-width: 1024px) 290px, 32vw" alt="" width={800} height={800}
      className="segunda-foto pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] object-contain" />
  );
}

/** `cinta`: etiqueta opcional arriba a la derecha de la foto (ej.: "Top ventas") */
/** `fila` (idea 38): en la vista de lista, la foto va a la izquierda y la información a la derecha */
export function TarjetaProducto({ producto: p, prioridad = false, cinta, fila = false }: { producto: Producto; prioridad?: boolean; cinta?: string; fila?: boolean }) {
  const { version, elegirVersion, cantidadDe, agregar, avisar } = useTienda();
  const i = Math.min(version(p.id), p.opciones.length - 1);
  const o = p.opciones[i] ?? p.opciones[0];
  const q = cantidadDe(p.id, i);
  const tope = p.stock != null && q >= p.stock;
  const foto = useRef<HTMLAnchorElement>(null);
  const { vez, recien, marcar } = useAgregado();
  const [verSegunda, setVerSegunda] = useState(false);

  const alAgregar = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!agregar(p.id, i)) return;
    marcar();
    // La foto despega hacia el carrito (desde la foto de la tarjeta o, si no se ve entera, desde el botón)
    volarAlCarrito([foto.current, e.currentTarget], p.imagen && recurso(p.imagen));
    avisar(`Agregaste ${p.nombre}${o.nombre ? ` (${o.nombre})` : ""} al carrito`);
  };

  return (
    // tarjeta-eleva: con el mouse encima, la tarjeta sube un poco (animación 13)
    // Mejora 15: con el mouse encima, el dedo sobre la tarjeta o el foco del teclado, se baja la página de producto (ver lib/carga.ts)
    <article onPointerEnter={e => { precargarProducto(); if (e.pointerType === "mouse") precargarFoto(p.imagen); if (e.pointerType === "mouse" && !verSegunda && activa(62)) setVerSegunda(true); }}
      onTouchStart={precargarProducto} onFocus={precargarProducto}
      className={`tarjeta tarjeta-eleva group relative flex h-full overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-linea-fuerte hover:shadow-tarjeta ${fila ? "flex-row" : "flex-col"}`}>
      {/* Con el mouse encima de la tarjeta, la foto se acerca un poco (solo con mouse; en celular no queda pegado) */}
      <a ref={foto} href={hrefProducto(p.id)} onClick={e => abrirConVuelo(e, foto.current)} tabIndex={-1} aria-hidden="true" className={`escenario relative block aspect-square ${fila ? "w-32 shrink-0 self-start p-2.5 sm:w-44 sm:p-3" : "p-4"}`}>
        {/* Ancho de la tarjeta: 2 por fila en celular, 3 en tableta y 4 (unos 290 px) en computador */}
        <FotoProducto producto={p} alt="" prioridad={prioridad} tamanos="(min-width: 1024px) 290px, (min-width: 768px) 32vw, 48vw" className="foto-principal motion-safe:group-hover:scale-[1.05]" />
        <SegundaFoto producto={p} ver={verSegunda} />
        <Insignia producto={p} />
        {cinta && <span className="absolute right-14 top-2 rounded-sm bg-acento-suave px-1.5 py-0.5 text-[12.5px] font-semibold text-acento-texto">{cinta}</span>}
      </a>
      {/* Mejoras 7 y 8: guardar en favoritos (fuera del enlace de la foto: un botón no puede ir dentro de un enlace) */}
      <BotonFavorito id={p.id} nombre={p.nombre} className={`absolute top-2 z-10 ${fila ? "left-[5.25rem] sm:left-[8.25rem]" : "right-2"}`} />
      <div className={`flex min-w-0 flex-1 flex-col gap-1.5 border-linea/70 p-3.5 sm:p-4 ${fila ? "border-l" : "border-t"}`}>
        <p className="etiqueta truncate text-tinta-3">{etiquetaDe(p) || " "}</p>
        <h3 className="font-sans text-[15px] font-semibold leading-snug tracking-normal">
          <a href={hrefProducto(p.id)} onClick={e => abrirConVuelo(e, foto.current)} title={p.nombre} className="line-clamp-2 hover:text-marca">{p.nombre}</a>
        </h3>
        {p.specs.length > 0 && <p className="line-clamp-1 text-[13px] text-tinta-2">{p.specs.join(" · ")}</p>}
        {p.nota && <p><NotaProducto nota={p.nota} /></p>}
        <div className="mt-auto pt-2">
          {p.opciones.length > 1 && <ElegirVersion producto={p} i={i} elegir={j => elegirVersion(p.id, j)} />}
          {/* Precio arriba y botón a lo ancho: en celular las tarjetas miden ~165 px y no caben lado a lado */}
          {/* Rótulo pequeño encima del precio, como en el catálogo en PDF. Aquí el precio es el de la versión elegida, así
              que siempre dice «Precio». Todas las tarjetas tienen la misma parte de abajo (rótulo, precio, botón y línea del
              carrito): en cada fila los precios quedan a la misma altura */}
          <p className="mb-1 text-xs leading-none text-tinta-3">Precio</p>
          {p.consultar ? (
            <>
              <p className="font-display text-[16px] font-bold leading-tight tracking-tight text-tinta-2">Preguntar disponibilidad</p>
              <a href={waLink(textoConsulta(p, o.nombre))} target="_blank" rel="noopener" className="btn btn-sm btn-suave mt-3 w-full">
                <IconoWhatsApp className="h-4 w-4 shrink-0" />Preguntar
              </a>
              <p className="mt-1.5 h-4" />
            </>
          ) : (
            <>
              {/* Al cambiar de versión, el precio nuevo entra con un fundido corto (como en la página del producto) */}
              <p key={o.precio} className="font-display text-[19px] font-bold leading-none tracking-tight tabular-nums motion-safe:animate-entrar"><Pesos valor={o.precio} /></p>
              <button type="button" onClick={alAgregar} disabled={tope} className="btn btn-sm btn-suave mt-3 w-full">
                <EtiquetaAgregar vez={vez} recien={recien} cantidad={q} tope={tope} />
              </button>
              {/* Sin aria-live: el aviso general (Aviso.tsx) ya dice «Agregaste … al carrito»; antes hablaban dos a la vez */}
              <p className="mt-1.5 h-4 text-xs font-semibold text-marca">
                {q > 0 && <span key={q} className="inline-block motion-safe:animate-entrar">{q} en el carrito</span>}
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
