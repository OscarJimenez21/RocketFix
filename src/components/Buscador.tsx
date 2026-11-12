/* Buscador general de la cabecera: sugerencias al escribir (productos y secciones) y búsquedas populares al tocarlo */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BUSQUEDAS_POPULARES, TIENDA_VISTA, VISTAS, deTienda, desde } from "../data/catalogo";
import { RECORTE, TIENDAS } from "../data/tiendas";
import { activa, reducirMovimiento } from "../lib/animaciones";
import { buscarProductos, palabrasDe, resaltar, sugerirCorreccion } from "../lib/busqueda";
import { precargarBuscar } from "../lib/carga";
import { anotarBusqueda, borrarBusquedas, useBusquedasRecientes } from "../lib/busquedasRecientes";
import { useEnPantalla } from "../lib/enPantalla";
import { dinero, norm, recurso } from "../lib/formato";
import { alCambiarPagina, hrefBusqueda, hrefProducto, hrefDe, navegar } from "../lib/rutas";
import { FotoProducto } from "./FotoProducto";
import { IconoBuscar, IconoCerrar, IconoReloj, IconoWhatsApp } from "./Iconos";
import { waLink } from "../lib/whatsapp";

type Opcion = { href: string; clave: string };

const TEXTO_CAMPO = "Buscar celulares, portátiles, consolas…";
/** Animación 9: con el campo vacío, el texto de ayuda va mostrando búsquedas de ejemplo, una cada 2,8 s */
const EJEMPLOS = [TEXTO_CAMPO, ...BUSQUEDAS_POPULARES.map(b => `Buscar «${b}»`)];

export function Buscador({ inicial = "" }: { inicial?: string }) {
  const [q, setQ] = useState(inicial);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const caja = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const idLista = useId();
  const recientes = useBusquedasRecientes();

  // Mejora 3: en computador, la tecla «/» (o Ctrl+K) lleva al buscador desde cualquier página, como en las tiendas grandes.
  // Solo responde el buscador que se ve (hay uno para computador y otro para celular) y no mientras se escribe en otro campo
  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      const atajo = (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k");
      if (!atajo || !campoRef.current || campoRef.current.offsetParent === null) return;
      const en = document.activeElement as HTMLElement | null;
      if (e.key === "/" && en && (en.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(en.tagName))) return;
      e.preventDefault();
      campoRef.current.focus();
      campoRef.current.select();
    };
    document.addEventListener("keydown", alTecla);
    return () => document.removeEventListener("keydown", alTecla);
  }, []);

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

  // Mejora 5: si no hay nada, se propone la palabra más parecida del catálogo (ver sugerirCorreccion)
  const correccion = useMemo(() => (palabras.length && !total ? sugerirCorreccion(q) : null), [q, palabras.length, total]);
  const opciones: Opcion[] = palabras.length
    ? [...secciones.map(t => ({ href: hrefDe(t.vista), clave: t.vista })), ...productos.map(p => ({ href: hrefProducto(p.id), clave: p.id })),
       ...(total ? [{ href: hrefBusqueda(q), clave: "todos" }] : []), ...(correccion ? [{ href: hrefBusqueda(correccion), clave: "correccion" }] : [])]
    : [...recientes.map(b => ({ href: hrefBusqueda(b), clave: `r-${b}` })), ...BUSQUEDAS_POPULARES.map(b => ({ href: hrefBusqueda(b), clave: b }))];

  useEffect(() => {
    const fuera = (e: PointerEvent) => { if (!caja.current?.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener("pointerdown", fuera);
    return () => document.removeEventListener("pointerdown", fuera);
  }, []);
  useEffect(() => {
    const alNavegar = () => setAbierto(false);
    return alCambiarPagina(alNavegar);
  }, []);
  useEffect(() => setActivo(-1), [q]);

  const ir = (href: string) => { navegar(href); setAbierto(false); };
  // Mejora 4: borrar lo escrito con la ✕ (igual en todos los navegadores; la ✕ propia de Chrome se esconde en el CSS)
  const limpiar = () => { setQ(""); setAbierto(true); campoRef.current?.focus(); };

  const alTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAbierto(true); setActivo(a => Math.min(opciones.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo(a => Math.max(-1, a - 1)); }
    // Esc cierra la lista; con la lista ya cerrada, un segundo Esc borra lo escrito
    else if (e.key === "Escape") { if (!abierto && q) setQ(""); setAbierto(false); setActivo(-1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const elegida = opciones[activo];
      if (elegida) ir(elegida.href);
      // (la página de resultados la anota en «recientes» si encuentra algo)
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
          ref={campoRef} type="search" value={q} placeholder={rueda ? "" : TEXTO_CAMPO} autoComplete="off" enterKeyHint="search" autoCapitalize="none" autoCorrect="off" spellCheck={false}
          role="combobox" aria-keyshortcuts="/ Control+K" aria-expanded={hayLista} aria-controls={hayLista ? idLista : undefined} aria-autocomplete="list"
          aria-activedescendant={activo >= 0 ? idOpcion(activo) : undefined}
          onChange={e => { setQ(e.target.value); setAbierto(true); }} onFocus={() => { setAbierto(true); setEnfocado(true); precargarBuscar(); }} onBlur={() => setEnfocado(false)} onKeyDown={alTecla}
          className="h-11 w-full rounded border border-linea-fuerte bg-fondo pl-10 pr-11 text-[15px] placeholder:text-tinta-3 focus:border-marca focus:bg-superficie focus:outline-none focus:ring-2 focus:ring-marca/20"
        />
        {q ? (
          <button type="button" onClick={limpiar} aria-label="Borrar la búsqueda"
            className="limpiar-busqueda presionable absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded text-tinta-3 hover:bg-linea hover:text-tinta">
            <IconoCerrar className="h-4 w-4" />
          </button>
        ) : (
          // En computador, la pista del atajo «/» (ver arriba)
          <kbd aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 hidden h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded border border-linea-fuerte bg-superficie px-1.5 font-sans text-xs text-tinta-3 [@media(hover:hover)_and_(pointer:fine)]:flex">/</kbd>
        )}
        {/* Texto de ayuda que rueda (los lectores de pantalla ya tienen el rótulo «Buscar en toda la tienda») */}
        {rueda && !q && (
          <span aria-hidden="true" className="ayuda-campo pointer-events-none absolute inset-y-0 left-10 right-11 flex items-center overflow-hidden text-[15px] text-tinta-3">
            <span key={ejemplo} className={`truncate${ejemplo ? " rueda" : ""}`}>{EJEMPLOS[ejemplo]}</span>
          </span>
        )}
      </label>
      {/* La lista (role="listbox") lleva solo opciones: el título de las populares y el aviso de «no encontramos» van
          fuera de ella, como pide el patrón de combobox (antes un <p> y un <div> quedaban dentro de la lista) */}
      {abierto && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70dvh] origin-top overflow-y-auto overscroll-contain rounded-md border border-linea bg-superficie p-2 shadow-flota motion-safe:animate-desplegar">
          {!palabras.length && (
            <>
              {recientes.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-2.5 pb-1 pt-1">
                    <p id={`${idLista}-recientes`} className="etiqueta">Tus búsquedas recientes</p>
                    <button type="button" onClick={borrarBusquedas} className="-my-3 min-h-[44px] px-2 text-xs font-semibold text-tinta-2 hover:text-tinta hover:underline">Borrar</button>
                  </div>
                  <div role="listbox" aria-labelledby={`${idLista}-recientes`} className="mb-1.5 grid">
                    {recientes.map((b, i) => (
                      <a key={b} id={idOpcion(i)} role="option" aria-selected={i === activo} href={hrefBusqueda(b)} onClick={() => anotarBusqueda(b)}
                        className={`flex items-center gap-2.5 rounded px-2.5 py-2 text-[14.5px] ${i === activo ? "bg-marca-suave" : "hover:bg-fondo"}`}>
                        <IconoReloj className="h-4 w-4 shrink-0 text-tinta-3" /><span className="truncate">{b}</span>
                      </a>
                    ))}
                  </div>
                </>
              )}
              <p id={`${idLista}-titulo`} className="etiqueta px-2.5 pb-1.5 pt-1">Búsquedas populares</p>
              <div id={idLista} role="listbox" aria-labelledby={`${idLista}-titulo`} className="flex flex-wrap gap-1.5 px-1.5 pb-1.5">
                {BUSQUEDAS_POPULARES.map((b, k) => { const i = k + recientes.length; return (
                  <a key={b} id={idOpcion(i)} role="option" aria-selected={i === activo} href={hrefBusqueda(b)}
                    className={`rounded-full border px-3 py-1 text-sm ${i === activo ? "border-marca bg-marca-suave" : "border-linea hover:border-linea-fuerte"}`}>{b}</a>
                ); })}
              </div>
              {/* Idea 3: debajo, las secciones con su producto recortado, para explorar sin escribir */}
              <p className="etiqueta border-t border-linea px-2.5 pb-1.5 pt-3">Explorar secciones</p>
              <ul className="grid grid-cols-3 gap-1 px-1 pb-1 sm:grid-cols-4">
                {TIENDAS.map(t => (
                  <li key={t.id}>
                    <a href={hrefDe(t.vista)} onClick={() => setAbierto(false)}
                      className="presionable flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center text-[12.5px] font-semibold leading-tight text-tinta-2 hover:bg-fondo hover:text-tinta">
                      <img src={recurso(`fotos/recortes/${RECORTE[t.id]}.webp`)} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-10 w-10 object-contain" />
                      {t.menu}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {palabras.length > 0 && opciones.length > 0 && (
          <div id={idLista} role="listbox" aria-label="Sugerencias de búsqueda">
          {secciones.map(t => {
            n++;
            return (
              <a key={t.vista} id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefDe(t.vista)} className={claseOpcion(n)}>
                <img src={recurso(`fotos/recortes/${RECORTE[t.id]}.webp`)} alt="" decoding="async" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                <span className="etiqueta">Sección</span>
                <span className="font-semibold">{VISTAS[TIENDA_VISTA[t.id]]}</span>
                <span className="ml-auto text-sm text-tinta-3">{deTienda(t.id).length}</span>
              </a>
            );
          })}
          {productos.map(p => {
            n++;
            return (
              <a key={p.id} id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefProducto(p.id)} className={claseOpcion(n)}>
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
          {correccion && (() => {
            n++;
            return (
              <a id={idOpcion(n)} role="option" aria-selected={n === activo} href={hrefBusqueda(correccion)} onClick={() => anotarBusqueda(correccion)}
                className={`block rounded px-2.5 py-2.5 text-sm ${n === activo ? "bg-marca-suave" : "hover:bg-fondo"}`}>
                No encontramos “{q.trim()}”. ¿Quisiste decir <b className="font-semibold text-marca-texto">{correccion}</b>?
              </a>
            );
          })()}
          </div>
          )}
          {palabras.length > 0 && total === 0 && !correccion && (
            <div role="status" className="px-2.5 py-3 text-sm text-tinta-2">
              <p>No encontramos “{q.trim()}”. Escríbenos y te decimos si lo conseguimos.</p>
              {/* Mejora 6: el botón para preguntar va ahí mismo, sin tener que buscarlo */}
              <a href={waLink(`Hola, estoy buscando: ${q.trim()}`)} target="_blank" rel="noopener" className="btn btn-wa btn-sm mt-2.5"><IconoWhatsApp />Preguntar por WhatsApp</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
