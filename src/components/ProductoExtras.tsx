/* Partes nuevas de la página de producto (ideas del 11/11/2026):
   - EnvioGratis (19): cuánto falta para el envío gratis contando lo que ya hay en el carrito más este producto.
   - FichaTecnica (17): la tabla de características; si es larga, muestra 8 filas y un botón para ver todas.
   - Comparador (16): compara este producto con otro de la misma categoría, fila por fila.
   - Recientes (15): los productos vistos hace poco en este navegador. */
import { useEffect, useMemo, useRef, useState } from "react";
import { CONFIG, PRODUCTOS, desde, rotuloPrecio } from "../data/catalogo";
import { useTienda } from "../estado/TiendaContext";
import { armarDescripcion, useDescripcion } from "../lib/descripcion";
import { dinero, norm } from "../lib/formato";
import { subtotalDe } from "../lib/pedido";
import { hrefProducto } from "../lib/rutas";
import { borrarVistos } from "../lib/vistos";
import type { Producto } from "../types";
import { FilaProductos } from "./FilaProductos";
import { FotoProducto } from "./FotoProducto";
import { IconoComparar, IconoMoto, IconoReloj } from "./Iconos";

/** Idea 19: con este producto (y lo que ya hay en el carrito), ¿cuánto falta para el envío gratis? Usa los mismos topes
    del carrito (config.json): Bogotá y alrededores, y el resto del país */
export function EnvioGratis({ precio }: { precio: number }) {
  const { lineas } = useTienda();
  const total = subtotalDe(lineas) + precio;
  const bog = CONFIG.envios.bogota.gratisDesde, nac = CONFIG.envios.nacional.gratisDesde;
  const avance = Math.min(1, total / bog);
  // Animación 79: la barra arranca vacía y se llena al aparecer en pantalla
  const barra = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState(false);
  useEffect(() => {
    const el = barra.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVista(true); return; }
    const o = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setVista(true); o.disconnect(); } }, { threshold: 0.6 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  const texto = total >= nac
    ? "Con este producto, el envío es gratis a toda Colombia."
    : total >= bog
      ? `Con este producto, el envío en Bogotá es gratis. Para el resto del país te faltarían ${dinero(nac - total)}.`
      : `Te faltan ${dinero(bog - total)} para el envío gratis en Bogotá${lineas.length ? " (contando tu carrito)" : ""}.`;
  return (
    <div className="mt-4 rounded bg-fondo px-3 py-2.5">
      <p className="flex items-start gap-2 text-[13px] text-tinta-2"><IconoMoto className="mt-px h-4 w-4 shrink-0 text-marca" />{texto}</p>
      {total < bog && (
        <div ref={barra} aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-linea">
          <div className="barra-envio h-full origin-left rounded-full bg-marca transition-transform duration-700 ease-salida" style={{ transform: `scaleX(${vista ? avance : 0})` }} />
        </div>
      )}
    </div>
  );
}

/** Idea 17: ficha técnica. Con más de 10 filas se ven 8 y el resto se abre con un botón */
export function FichaTecnica({ filas }: { filas: [string, string][] }) {
  const [todas, setTodas] = useState(false);
  const tabla = useRef<HTMLDListElement>(null);
  const larga = filas.length > 10;
  // Mejora: al cerrar con «Ver menos», la página vuelve al comienzo de la tabla (si no, quedaba más abajo, en otra sección)
  const alternar = () => {
    if (todas) { const r = tabla.current?.getBoundingClientRect(); if (r && r.top < 0) tabla.current?.scrollIntoView({ block: "start" }); }
    setTodas(t => !t);
  };
  const visibles = larga && !todas ? filas.slice(0, 8) : filas;
  return (
    <>
      <dl ref={tabla} className="mt-3 overflow-hidden rounded-md border border-linea bg-superficie text-sm">
        {visibles.map(([k, v], n) => (
          <div key={`${k}-${n}`} className={`grid grid-cols-[minmax(110px,38%)_1fr] gap-3 px-4 py-2.5 ${n ? "border-t border-linea" : ""} ${n >= 8 ? "motion-safe:animate-entrar" : ""}`}>
            <dt className="font-semibold text-tinta-2">{k}</dt><dd className="break-words">{v}</dd>
          </div>
        ))}
      </dl>
      {larga && (
        <button type="button" onClick={alternar} aria-expanded={todas} className="enlace-suelto mt-1 text-sm">
          {todas ? "Ver menos" : `Ver las ${filas.length} características`}
        </button>
      )}
    </>
  );
}

/** Candidatos para comparar: misma sección y categoría, con precio, los de precio más parecido primero */
function candidatos(p: Producto): Producto[] {
  const base = desde(p);
  return PRODUCTOS.filter(r => r.id !== p.id && r.tienda === p.tienda && r.categoria === p.categoria && !r.consultar)
    .sort((a, b) => Math.abs(desde(a) - base) - Math.abs(desde(b) - base))
    .slice(0, 40);
}

/** Idea 16: comparar con otro producto. Las filas salen de las fichas de los dos (primero las de este) */
export function Comparador({ producto: p }: { producto: Producto }) {
  const opciones = useMemo(() => candidatos(p), [p]);
  const [otroId, setOtroId] = useState("");
  const [soloDiferencias, setSoloDiferencias] = useState(false);
  const otro = opciones.find(o => o.id === otroId);
  const dA = useDescripcion(p.id);
  const dB = useDescripcion(otro?.id ?? p.id);
  if (opciones.length === 0) return null;

  const fichaA = armarDescripcion(p, dA ?? {}).filas;
  const fichaB = otro ? armarDescripcion(otro, dB ?? {}).filas : [];
  const valor = (ficha: [string, string][], k: string) => ficha.find(([c]) => norm(c) === norm(k))?.[1] ?? "—";
  const claves = [...fichaA.map(([k]) => k), ...fichaB.map(([k]) => k).filter(k => !fichaA.some(([c]) => norm(c) === norm(k)))];
  // Mejora: las filas donde los dos productos son distintos se marcan, y se puede dejar solo esas
  const distinta = (k: string) => norm(valor(fichaA, k)) !== norm(valor(fichaB, k));
  const cuantasDistintas = claves.filter(distinta).length;
  const filas = soloDiferencias ? claves.filter(distinta) : claves;

  return (
    <section aria-labelledby="t-comparar" className="contenedor py-10">
      <h2 id="t-comparar" className="flex items-center gap-2 text-xl font-extrabold"><IconoComparar className="h-5 w-5 text-marca" />Compáralo con otro</h2>
      <label className="mt-3 block max-w-md">
        <span className="rotulo">Elige otro producto de la misma categoría</span>
        <select value={otroId} onChange={e => setOtroId(e.target.value)} className="campo">
          <option value="">Elegir…</option>
          {opciones.map(o => <option key={o.id} value={o.id}>{o.nombre} · {rotuloPrecio(o) === "Desde" ? "desde " : ""}{dinero(desde(o))}</option>)}
        </select>
      </label>
      {otro && claves.length > 0 && (
        <label className="mt-4 flex min-h-[44px] w-fit cursor-pointer items-center gap-2 text-sm text-tinta-2">
          <input type="checkbox" checked={soloDiferencias} onChange={e => setSoloDiferencias(e.target.checked)} className="h-4 w-4" />
          Ver solo lo que cambia ({cuantasDistintas} de {claves.length})
        </label>
      )}
      {otro && (
        <div key={otro.id} className="mt-3 overflow-x-auto rounded-md border border-linea motion-safe:animate-entrar">
          <table className="w-full min-w-[560px] border-collapse bg-superficie text-left text-sm">
            <caption className="sr-only">Comparación entre {p.nombre} y {otro.nombre}</caption>
            <thead>
              <tr className="align-top">
                <th scope="col" className="sticky left-0 z-[1] w-[28%] bg-superficie p-3"><span className="sr-only">Característica</span></th>
                {[p, otro].map(x => (
                  <th key={x.id} scope="col" className="w-[36%] border-l border-linea p-3 font-semibold">
                    <span className="escenario mb-2 block h-20 w-20 rounded border border-linea p-1"><FotoProducto producto={x} alt="" tamanos="80px" /></span>
                    {x.id === p.id ? x.nombre : <a href={hrefProducto(x.id)} className="hover:text-marca hover:underline">{x.nombre}</a>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-linea">
                <th scope="row" className="sticky left-0 z-[1] bg-superficie p-3 font-semibold text-tinta-2">Precio</th>
                {[p, otro].map(x => <td key={x.id} className="border-l border-linea p-3 font-display font-bold tabular-nums">{rotuloPrecio(x) === "Desde" ? "Desde " : ""}{dinero(desde(x))}</td>)}
              </tr>
              {filas.map((k, n) => (
                <tr key={k} style={{ "--orden": Math.min(n, 12) } as React.CSSProperties}
                  className={`fila-comparar border-t border-linea align-top ${distinta(k) ? "fila-distinta" : ""}`}>
                  <th scope="row" className="sticky left-0 z-[1] bg-superficie p-3 font-semibold text-tinta-2">{k}</th>
                  <td className="break-words border-l border-linea p-3">{valor(fichaA, k)}</td>
                  <td className="break-words border-l border-linea p-3">{valor(fichaB, k)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Idea 15: vistos recientemente (en este navegador). Se muestra con 2 o más */
export function Recientes({ productos, fondo = false }: { productos: Producto[]; fondo?: boolean }) {
  if (productos.length < 2) return null;
  return (
    <section aria-labelledby="t-recientes" className={fondo ? "border-t border-linea bg-fondo" : ""}>
      <div className="contenedor py-10">
        <FilaProductos productos={productos.slice(0, 10)} etiqueta="Vistos recientemente"
          encabezado={<div className="flex flex-wrap items-center gap-x-4">
            <h2 id="t-recientes" className="flex items-center gap-2 text-xl font-extrabold"><IconoReloj className="h-5 w-5 text-marca" />Vistos recientemente</h2>
            <button type="button" onClick={borrarVistos} className="enlace-suelto min-h-[44px] text-sm">Borrar la lista</button>
          </div>} />
      </div>
    </section>
  );
}
