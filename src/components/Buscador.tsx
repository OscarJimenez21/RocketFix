/* Buscador general de la cabecera: sugerencias al escribir (productos y secciones) y búsquedas populares al tocarlo */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BUSQUEDAS_POPULARES, TIENDA_VISTA, VISTAS, deTienda, desde } from "../data/catalogo";
import { TIENDAS } from "../data/tiendas";
import { activa, reducirMovimiento } from "../lib/animaciones";
import { buscarProductos, palabrasDe, resaltar } from "../lib/busqueda";
import { useEnPantalla } from "../lib/enPantalla";
import { dinero, norm } from "../lib/formato";
import { hrefBusqueda, hrefProducto } from "../lib/rutas";
import { FotoProducto } from "./FotoProducto";
import { IconoBuscar } from "./Iconos";

type Opcion = { href: string; clave: string };

const TEXTO_CAMPO = "Buscar celulares, portátiles, consolas…";
/** Animación 9: con el campo vacío, el texto de ayuda va mostrando búsquedas de ejemplo, una cada 2,8 s */
const EJEMPLOS = [TEXTO_CAMPO, ...BUSQUEDAS_POPULARES.map(b => `Buscar «${b}»`)];

export function Buscador({ inicial = "" }: { inicial?: string }) {
  const [q, setQ] = useState(inicial);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const caja = useRef<HTMLDivElement>(null);
  const idLista = useId();

  useEffect(() => setQ(inicial), [inicial]);

  // Los ejemplos solo ruedan mientras el campo se ve, está vacío y no se está escribiendo en él
  const [rueda] = useState(() => activa(9) && !reducirMovimiento());
  const [ejemplo, setEjemplo] = useState(0);
  const [enfocado, setEnfocado] = useState(false);
  const visible = useEnPantalla(caja);
  useEffect(() => {
    if (!rueda || q || enfocado || !visible) return;
    const reloj = window.setInterval(() => setEjemplo(k => (k + 1) % EJEMPLOS.length), 2800);
    return () => window.clearInterval(reloj);
  }, [rueda, q, enfocado, visible]);

  const palabras = palabrasDe(q);
  // Una sola búsqueda por texto (antes se hacían dos: una para los 6 primeros y otra para contar)
  const encontrados = useMemo(() => buscarProductos(q), [q]);
  const productos = encontrados.slice(0, 6);
  const total = encontrados.length;
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
  // Hay lista de opciones abierta (sin resultados solo se muestra el aviso, que no es una lista)
  const hayLista = abierto && opciones.length > 0;
  let n = -1;
  const claseOpcion = (i: number) => `flex items-center gap-3 rounded px-2.5 py-2 ${i === activo ? "bg-marca-suave" : "hover:bg-fondo"}`;

  return (
    <div ref={caja} className="relative w-full" role="search">
      <label className="relative block">
        <span className="sr-only">Buscar en toda la tienda</span>
        {/* lupa: al escribir se inclina y se pinta de verde (animación 11) */}
        <IconoBuscar className="lupa pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-tinta-3" />
        <input
          type="search" value={q} placeholder={rueda ? "" : TEXTO_CAMPO} autoComplete="off" enterKeyHint="search"
          role="combobox" aria-expanded={hayLista} aria-controls={hayLista ? idLista : undefined} aria-autocomplete="list"
          aria-activedescendant={activo >= 0 ? idOpcion(activo) : undefined}
          onChange={e => { setQ(e.target.value); setAbierto(true); }} onFocus={() => { setAbierto(true); setEnfocado(true); }} onBlur={() => setEnfocado(false)} onKeyDown={alTecla}
          className="h-11 w-full rounded border border-linea-fuerte bg-fondo pl-10 pr-3 text-[15px] placeholder:text-tinta-3 focus:border-marca focus:bg-white focus:outline-none focus:ring-2 focus:ring-marca/20"
        />
        {/* Texto de ayuda que rueda (los lectores de pantalla ya tienen el rótulo «Buscar en toda la tienda») */}
        {rueda && !q && (
          <span aria-hidden="true" className="ayuda-campo pointer-events-none absolute inset-y-0 left-10 right-3 flex items-center overflow-hidden text-[15px] text-tinta-3">
            <span key={ejemplo} className={`truncate${ejemplo ? " rueda" : ""}`}>{EJEMPLOS[ejemplo]}</span>
          </span>
        )}
      </label>
      {/* La lista (role="listbox") lleva solo opciones: el título de las populares y el aviso de «no encontramos» van
          fuera de ella, como pide el patrón de combobox (antes un <p> y un <div> quedaban dentro de la lista) */}
      {abierto && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70dvh] origin-top overflow-y-auto overscroll-contain rounded-md border border-linea bg-white p-2 shadow-flota motion-safe:animate-desplegar">
          {!palabras.length && (
            <>
              <p id={`${idLista}-titulo`} className="etiqueta px-2.5 pb-1.5 pt-1">Búsquedas populares</p>
              <div id={idLista} role="listbox" aria-labelledby={`${idLista}-titulo`} className="flex flex-wrap gap-1.5 px-1.5 pb-1.5">
                {/* sugerencia: entran una tras otra al abrir el buscador (animación 10) */}
                {BUSQUEDAS_POPULARES.map((b, i) => (
                  <a key={b} id={idOpcion(i)} role="option" aria-selected={i === activo} href={hrefBusqueda(b)} style={{ "--i": i } as React.CSSProperties}
                    className={`sugerencia rounded-full border px-3 py-1 text-sm ${i === activo ? "border-marca bg-marca-suave" : "border-linea hover:border-linea-fuerte"}`}>{b}</a>
                ))}
              </div>
            </>
          )}
          {palabras.length > 0 && opciones.length > 0 && (
          <div id={idLista} role="listbox" aria-label="Sugerencias de búsqueda">
          {secciones.map(t => {
            n++;
            return (
              <a key={t.vista} id={idOpcion(n)} role="option" aria-selected={n === activo} href={`#${t.vista}`} className={claseOpcion(n)}>
                <span className="etiqueta">Sección</span>
                <span className="font-semibold">{VISTAS[TIENDA_VISTA[t.id]]}</span>
                <span className="ml-auto text-sm text-tinta-3">{deTienda(t.id).length}</span>
              </a>
            );
          })}
          {productos.map(p => {
            n++;
            return (
              <a key={p.id} id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefProducto(p.id)} style={{ "--i": n } as React.CSSProperties} className={`sugerencia ${claseOpcion(n)}`}>
                <span className="escenario h-11 w-11 shrink-0 rounded border border-linea p-0.5"><FotoProducto producto={p} alt="" tamanos="44px" /></span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[14.5px] font-semibold">
                    {resaltar(p.nombre, palabras).map((t, k) => t.marcado ? <mark key={k} className="bg-transparent font-bold text-marca">{t.t}</mark> : <span key={k}>{t.t}</span>)}
                  </span>
                  <span className="block truncate text-xs text-tinta-2">{[VISTAS[TIENDA_VISTA[p.tienda]], p.marca].filter(Boolean).join(" · ")}</span>
                </span>
                {p.consultar ? (
                  <span className="w-[5.5rem] shrink-0 text-right text-xs font-semibold leading-tight text-tinta-2">Preguntar disponibilidad</span>
                ) : (
                  <span className="shrink-0 text-right text-sm font-semibold">
                    {p.opciones.length > 1 && <small className="block text-xs font-normal text-tinta-3">Desde</small>}
                    {dinero(desde(p))}
                  </span>
                )}
              </a>
            );
          })}
          {total > 0 && (() => {
            n++;
            return (
              <a id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefBusqueda(q)}
                className={`mt-1 block rounded px-2.5 py-2.5 text-center text-sm font-semibold text-marca ${n === activo ? "bg-marca-suave" : "hover:bg-fondo"}`}>
                {total === 1 ? "Ver el resultado" : `Ver los ${total} resultados`} de “{q.trim()}”
              </a>
            );
          })()}
          </div>
          )}
          {palabras.length > 0 && total === 0 && (
            <p role="status" className="px-2.5 py-3 text-sm text-tinta-2">No encontramos “{q.trim()}”. Escríbenos y te decimos si lo conseguimos.</p>
          )}
        </div>
      )}
    </div>
  );
}
