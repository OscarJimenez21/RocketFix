/* Buscador general de la cabecera: sugerencias al escribir (productos y secciones) y búsquedas populares al tocarlo */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BUSQUEDAS_POPULARES, TIENDA_VISTA, VISTAS, deTienda, desde } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { buscarProductos, palabrasDe, resaltar } from "../lib/busqueda";
import { dinero, norm } from "../lib/formato";
import { hrefBusqueda, hrefProducto } from "../lib/rutas";
import { FotoProducto } from "./FotoProducto";
import { IconoBuscar } from "./Iconos";

type Opcion = { href: string; clave: string };

export function Buscador({ inicial = "" }: { inicial?: string }) {
  const [q, setQ] = useState(inicial);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const caja = useRef<HTMLDivElement>(null);
  const idLista = useId();

  useEffect(() => setQ(inicial), [inicial]);

  const palabras = palabrasDe(q);
  const productos = useMemo(() => (palabras.length ? buscarProductos(q).slice(0, 6) : []), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = useMemo(() => (palabras.length ? buscarProductos(q).length : 0), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const secciones = palabras.length
    ? TIENDAS.filter(t => palabras.every(w => norm(t.titulo + " " + t.menu).includes(w))).slice(0, 3)
    : [];

  const opciones: Opcion[] = palabras.length
    ? [...secciones.map(t => ({ href: `#${t.vista}`, clave: t.vista })), ...productos.map(p => ({ href: hrefProducto(p.id), clave: p.id })),
       ...(total ? [{ href: hrefBusqueda(q), clave: "todos" }] : [])]
    : BUSQUEDAS_POPULARES.map(b => ({ href: hrefBusqueda(b), clave: b }));

  useEffect(() => {
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, []);
  useEffect(() => {
    const alNavegar = () => setAbierto(false);
    window.addEventListener("hashchange", alNavegar);
    return () => window.removeEventListener("hashchange", alNavegar);
  }, []);
  useEffect(() => setActivo(-1), [q]);

  const ir = (href: string) => { location.hash = href; setAbierto(false); };

  const alTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAbierto(true); setActivo(a => Math.min(opciones.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo(a => Math.max(-1, a - 1)); }
    else if (e.key === "Escape") { setAbierto(false); setActivo(-1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const elegida = opciones[activo];
      if (elegida) ir(elegida.href);
      else if (q.trim()) ir(hrefBusqueda(q));
    }
  };

  const idOpcion = (i: number) => `${idLista}-${i}`;
  let n = -1;
  const claseOpcion = (i: number) => `flex items-center gap-3 rounded px-2.5 py-2 ${i === activo ? "bg-marca-suave" : "hover:bg-fondo"}`;

  return (
    <div ref={caja} className="relative w-full" role="search">
      <label className="relative block">
        <span className="sr-only">Buscar en toda la tienda</span>
        <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-tinta-3" />
        <input
          type="search" value={q} placeholder="Buscar celulares, portátiles, consolas…" autoComplete="off" enterKeyHint="search"
          role="combobox" aria-expanded={abierto} aria-controls={idLista} aria-autocomplete="list"
          aria-activedescendant={activo >= 0 ? idOpcion(activo) : undefined}
          onChange={e => { setQ(e.target.value); setAbierto(true); }} onFocus={() => setAbierto(true)} onKeyDown={alTecla}
          className="h-11 w-full rounded border border-linea-fuerte bg-fondo pl-10 pr-3 text-[15px] placeholder:text-tinta-3 focus:border-marca focus:bg-white focus:outline-none focus:ring-2 focus:ring-marca/20"
        />
      </label>
      {abierto && (
        <div id={idLista} role="listbox" aria-label="Sugerencias de búsqueda"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-md border border-linea bg-white p-2 shadow-flota">
          {!palabras.length && (
            <>
              <p className="etiqueta px-2.5 pb-1.5 pt-1">Búsquedas populares</p>
              <div className="flex flex-wrap gap-1.5 px-1.5 pb-1.5">
                {BUSQUEDAS_POPULARES.map((b, i) => (
                  <a key={b} id={idOpcion(i)} role="option" aria-selected={i === activo} href={hrefBusqueda(b)}
                    className={`rounded-full border px-3 py-1 text-sm ${i === activo ? "border-marca bg-marca-suave" : "border-linea hover:border-linea-fuerte"}`}>{b}</a>
                ))}
              </div>
            </>
          )}
          {palabras.length > 0 && secciones.map(t => {
            n++;
            return (
              <a key={t.vista} id={idOpcion(n)} role="option" aria-selected={n === activo} href={`#${t.vista}`} className={claseOpcion(n)}>
                <span className="etiqueta">Sección</span>
                <span className="font-semibold">{VISTAS[TIENDA_VISTA[t.id]]}</span>
                <span className="ml-auto text-sm text-tinta-3">{deTienda(t.id).length}</span>
              </a>
            );
          })}
          {palabras.length > 0 && productos.map(p => {
            n++;
            return (
              <a key={p.id} id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefProducto(p.id)} className={claseOpcion(n)}>
                <span className="h-11 w-11 shrink-0 rounded border border-linea bg-white p-0.5"><FotoProducto producto={p} alt="" /></span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[14.5px] font-semibold">
                    {resaltar(p.nombre, palabras).map((t, k) => t.marcado ? <mark key={k} className="bg-transparent font-bold text-marca">{t.t}</mark> : <span key={k}>{t.t}</span>)}
                  </span>
                  <span className="block truncate text-xs text-tinta-2">{[VISTAS[TIENDA_VISTA[p.tienda]], p.marca].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="shrink-0 text-right text-sm font-semibold">
                  {p.opciones.length > 1 && <small className="block text-[11px] font-normal text-tinta-3">Desde</small>}
                  {dinero(desde(p))}
                </span>
              </a>
            );
          })}
          {palabras.length > 0 && total > 0 && (() => {
            n++;
            return (
              <a id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefBusqueda(q)}
                className={`mt-1 block rounded px-2.5 py-2.5 text-center text-sm font-semibold text-marca ${n === activo ? "bg-marca-suave" : "hover:bg-fondo"}`}>
                {total === 1 ? "Ver el resultado" : `Ver los ${total} resultados`} de “{q.trim()}”
              </a>
            );
          })()}
          {palabras.length > 0 && total === 0 && (
            <p className="px-2.5 py-3 text-sm text-tinta-2">No encontramos “{q.trim()}”. Escríbenos y te decimos si lo conseguimos.</p>
          )}
        </div>
      )}
    </div>
  );
}
