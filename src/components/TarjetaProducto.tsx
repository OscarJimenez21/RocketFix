import { useCallback, useEffect, useRef, useState } from "react";
import { etiquetaDe, textoConsulta } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { dinero, recurso } from "../lib/formato";
import { hrefProducto } from "../lib/rutas";
import { volarAlCarrito } from "../lib/vuelo";
import { waLink } from "../lib/whatsapp";
import type { Producto } from "../types";
import { FotoProducto } from "./FotoProducto";
import { IconoCheck, IconoWhatsApp } from "./Iconos";

/** Etiqueta del estado cuando no es nuevo (CPO, Usado, Open box) */
export function Insignia({ producto }: { producto: Producto }) {
  if (producto.estado === "Nuevo") return null;
  return <span className="absolute left-2 top-2 rounded-sm bg-tinta px-1.5 py-0.5 text-[12.5px] font-semibold text-white">{producto.estado}</span>;
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

/** `cinta`: etiqueta opcional arriba a la derecha de la foto (ej.: "Top ventas") */
export function TarjetaProducto({ producto: p, prioridad = false, cinta }: { producto: Producto; prioridad?: boolean; cinta?: string }) {
  const { version, elegirVersion, cantidadDe, agregar, avisar } = useTienda();
  const i = Math.min(version(p.id), p.opciones.length - 1);
  const o = p.opciones[i] ?? p.opciones[0];
  const q = cantidadDe(p.id, i);
  const tope = p.stock != null && q >= p.stock;
  const foto = useRef<HTMLAnchorElement>(null);
  const { vez, recien, marcar } = useAgregado();

  const alAgregar = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!agregar(p.id, i)) return;
    marcar();
    // La foto despega hacia el carrito (desde la foto de la tarjeta o, si no se ve entera, desde el botón)
    volarAlCarrito([foto.current, e.currentTarget], p.imagen && recurso(p.imagen));
    avisar(`Agregaste ${p.nombre}${o.nombre ? ` (${o.nombre})` : ""} al carrito`);
  };

  return (
    // tarjeta-eleva: con el mouse encima, la tarjeta sube un poco (animación 13)
    <article className="tarjeta tarjeta-eleva group relative flex h-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-linea-fuerte hover:shadow-tarjeta">
      {/* Con el mouse encima de la tarjeta, la foto se acerca un poco (solo con mouse; en celular no queda pegado) */}
      <a ref={foto} href={hrefProducto(p.id)} tabIndex={-1} aria-hidden="true" className="escenario relative block aspect-square p-4">
        {/* Ancho de la tarjeta: 2 por fila en celular, 3 en tableta y 4 (unos 290 px) en computador */}
        <FotoProducto producto={p} alt="" prioridad={prioridad} tamanos="(min-width: 1024px) 290px, (min-width: 768px) 32vw, 48vw" className="motion-safe:group-hover:scale-[1.05]" />
        {/* Animación 46: reflejo de vidrio que cruza la foto una vez al pasar el mouse */}
        <span aria-hidden="true" className="reflejo" />
        <Insignia producto={p} />
        {cinta && <span className="absolute right-2 top-2 rounded-sm bg-acento-suave px-1.5 py-0.5 text-[12.5px] font-semibold text-acento-texto">{cinta}</span>}
      </a>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-linea/70 p-3.5 sm:p-4">
        <p className="etiqueta truncate text-tinta-3">{etiquetaDe(p) || " "}</p>
        <h3 className="font-sans text-[15px] font-semibold leading-snug tracking-normal">
          <a href={hrefProducto(p.id)} className="line-clamp-2 hover:text-marca">{p.nombre}</a>
        </h3>
        {p.specs.length > 0 && <p className="line-clamp-1 text-[13px] text-tinta-2">{p.specs.join(" · ")}</p>}
        {p.nota && <p><NotaProducto nota={p.nota} /></p>}
        <div className="mt-auto pt-2">
          {p.opciones.length > 1 && (
            <label className="mb-2.5 block">
              <span className="sr-only">{p.etiqueta || "Versión"} de {p.nombre}</span>
              <select value={i} onChange={e => elegirVersion(p.id, Number(e.target.value))}
                className="h-11 w-full truncate rounded border border-linea bg-fondo px-2 text-[13px] text-tinta focus:border-marca focus:outline-none sm:h-9">
                {p.opciones.map((op, j) => <option key={j} value={j}>{p.consultar ? op.nombre : `${op.nombre} · ${dinero(op.precio)}`}</option>)}
              </select>
            </label>
          )}
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
              <p key={o.precio} className="font-display text-[19px] font-bold leading-none tracking-tight tabular-nums motion-safe:animate-entrar">{dinero(o.precio)}</p>
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
